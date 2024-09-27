import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FaHome, FaBox, FaClipboardList, FaSearch, FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';

export default function Nav() {
    const pathname = usePathname();

    const inactiveLink = 'flex items-center gap-3 p-3 hover:bg-gray-200 rounded-l-lg transition-colors';
    const activeLink = inactiveLink + ' bg-gray-100 text-gray-800 font-semibold';

    async function logout() {
        await signOut();
    }

    return (
        <aside className="bg-white text-gray-600 p-6 pr-0 w-64 h-[85vh] m-4 rounded-lg">
            <Link href={'/'} className="flex items-center gap-3 mb-10 mr-4 text-gray-800 rounded-md p-2">
                <Image
                    src="/seto.png"
                    alt="Seto Logo"
                    width={32} // Adjust the width as needed
                    height={32} // Adjust the height as needed
                    className="w-8 h-8 p-1.5 rounded-lg"
                />
                <span className="text-xl font-bold">
                    Admin Panel
                </span>
            </Link>
            <nav className="flex flex-col gap-2">
                <Link href={'/'} className={pathname === '/' ? activeLink : inactiveLink}>
                    <FaHome size={20} />
                    Dashboard
                </Link>
                <Link href={'/orders'} className={pathname === '/orders' ? activeLink : inactiveLink}>
                    <FaClipboardList size={20} />
                    Siparişler
                </Link>
                <Link href={'/urunArama'} className={pathname === '/urunArama' ? activeLink : inactiveLink}>
                    <FaSearch size={20} />
                    Ürün Arama
                </Link>
                <Link href={'/cart'} className={pathname === '/cart' ? activeLink : inactiveLink}>
                    <FaShoppingCart size={20} />
                    Sipariş Taslağı
                </Link>
                <Link href={'/users'} className={pathname === '/users' ? activeLink : inactiveLink}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>

                    Kullanıcılar
                </Link>
                <button onClick={logout} className={inactiveLink + ' mt-8'}>
                    <FaSignOutAlt size={20} />
                    Çıkış Yap
                </button>
            </nav>
        </aside>
    )
}