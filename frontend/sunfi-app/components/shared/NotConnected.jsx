import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const NotConnected = () => {
    return (
        <Alert className="shadow-md text-2xl text-center">
            <AlertTitle>Vous y êtes presque</AlertTitle>
            <AlertDescription className="text-xl text-center pt-2" >
                Merci de vous connecter pour accéder à votre tableau de bord
            </AlertDescription>
        </Alert>

    )
}

export default NotConnected