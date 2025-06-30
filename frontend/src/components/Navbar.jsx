import logo from '../assets/logo.png';

function Navbar() {
    return (
        <nav className="shadow-md bg-light-purple">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="MindEase Logo" className="h-8" />
                        <a href="/" className="text-2xl font-bold text-gray-800 text-purple">MindEase</a>
                    </div>
                    <div className="items-center hidden gap-5 space-x-4 text-2xl font-medium md:flex">
                        <a href="/dashboard" className="text-purple hover:text-white hover:scale-110">Dashboard</a>
                        <a href="/journal" className="text-purple hover:text-white hover:scale-110">Journal</a>
                        <a href="/insights" className="text-purple hover:text-white hover:scale-110">AI Insights</a>
                        <button className="px-5 py-1 text-white rounded-full hover:text-white hover:bg-plum bg-purple hover:cursor-pointer">+ Journal</button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;