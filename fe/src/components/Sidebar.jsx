import {NavLink} from 'react-router-dom'

const items = [
    {label: "Dashboard", to: '/', icon: PresentationChartBarIcon},
    {label: "Projects", to: '/projects', icon: FolderIcon},
    {label: "Blocks", to: '/blocks', icon: CubeIcon},
]
export default function Sidebar() {
    return (
        <div className="relative flex h-screen w-64 flex-col bg-gray-800 text-white">
            <h5 className="text-center text-2xl font-bold py-4">My App</h5>
            <nav className="flex flex-col text-base">
                {items.map((item) =>{
                    <NavLink 
                        key={item.label}
                        to={item.to}
                    > {item.label} </NavLink>
                })}    
            </nav>
        </div>

    )
}