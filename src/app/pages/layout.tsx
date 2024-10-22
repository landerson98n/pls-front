import { Aside } from "./components/aside";
import { Header } from "./components/header/page";
import { SafraProvider } from "./utils/provider/safraProvider";
export default function Layout({ children }) {
    return (

        <div className="flex flex-col h-screen bg-white lg:flex-row">
            <Aside />
            <main className="flex-1 overflow-y-auto">
                <Header />
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
}