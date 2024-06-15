import { StoredContext } from "@/context"
import { Chip, Navbar, NavbarBrand, NavbarContent } from "@nextui-org/react"
import { on } from "events"
import Image from "next/image"
import { useRouter } from "next/router"
import logo from "public/utim.png"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export const Layout = ({ children }) => {
    const { memory: { socket } } = StoredContext()
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const router = useRouter()
    useEffect(() => {
        function onConnect() {
            setIsConnected(true)
            setTransport(socket.io.engine.transport.name)
            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name)
                console.log(transport.name)
            })
            socket.emit("connection")
        }
        function onDisconnect() {
            setIsConnected(false)
            setTransport("N/A")
        }
        function onTemplateError(data) {
            if (router.pathname === "/") {
                toast.error(data, {
                    id: "template-error",
                    duration: 5000,
                })
            }
        }
        function onCreatedTemplate(data) {
            if (router.pathname === "/secretary") {
                toast.success('Plantilla docente recibida', {
                    id: "template-created",
                    duration: 5000,
                })
            }
        }
        function onStatusUpdate(data) {
            if (router.pathname === "/") {
                toast.success(`Estado de la plantilla ${data.id} cambiado a ${data.status}`, {
                    id: "status",
                    duration: 5000,
                })
            }
        }
        if (socket.connected) {
            onConnect()
        }
        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)
        socket.on("createdTemplate", onCreatedTemplate)
        socket.on("updateStatus", onStatusUpdate)
        socket.on("templateError", onTemplateError)
        return () => {
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
        }
    }, [])
    return (
        <>
            <Navbar>
                <NavbarBrand>
                    <Image src={logo} alt="UTIM" className="hidden sm:w-32 sm:flex" width={80} height={80} />
                </NavbarBrand>
                <NavbarContent justify="center">
                    <h1 className="text-xl sm:text-2xl font-bold text-center">Gestión de plantillas docentes</h1>
                </NavbarContent>
                <NavbarContent justify="end">
                    <Chip variant="dot" className="hidden sm:flex" color={isConnected ? "success" : "error"}>{isConnected ? "Conectado" : "Desconectado"}</Chip>
                    <Chip variant="dot" radius="full" className="flex sm:hidden" color={isConnected ? "success" : "error"}>.</Chip>
                </NavbarContent>
            </Navbar>
            {children}
        </>
    )
}