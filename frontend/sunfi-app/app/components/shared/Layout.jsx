import { Footer } from './Footer.jsx'
import { Header } from './Header.jsx'

const Layout = ({ children }) => {
    return (
        <div className="app mx-auto sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-xl">
            <Header />
            <main className="main">
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default Layout