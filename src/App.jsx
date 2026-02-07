import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import "./App.css"
import { AuthProvider } from "./context/AuthContext"
import Home from "./pages/Home"
import About from "./pages/About"
import Vans from "./pages/Vans/Vans"
import VanDetail from "./pages/Vans/VanDetail"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import Dashboard from "./pages/Host/Dashboard"
import Income from "./pages/Host/Income"
import Reviews from "./pages/Host/Reviews"
import HostVans from "./pages/Host/HostVans"
import AddVan from "./pages/Host/AddVan"
import HostVanDetail from "./pages/Host/HostVanDetail"
import HostVanInfo from "./pages/Host/HostVanInfo"
import HostVanPricing from "./pages/Host/HostVanPricing"
import HostVanPhotos from "./pages/Host/HostVanPhotos"
import Messages from "./pages/Host/Messages"
import Profile from "./pages/Profile"
import PublicProfile from "./pages/PublicProfile"
import NotFound from "./pages/NotFound"
import Layout from "./components/Layout"
import HostLayout from "./components/HostLayout"
import AuthRequired from "./components/AuthRequired"

import "./server"

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
						<Route path="about" element={<About />} />
						<Route path="vans" element={<Vans />} />
						<Route path="vans/:id" element={<VanDetail />} />
						<Route path="user/:username" element={<PublicProfile />} />
						<Route path="login" element={<Login />} />
						<Route path="signup" element={<SignUp />} />
						
						<Route element={<AuthRequired />}>
							<Route path="profile" element={<Profile />} />
							<Route path="host" element={<HostLayout />}>
								<Route index element={<Dashboard />} />
								<Route path="income" element={<Income />} />
								<Route path="reviews" element={<Reviews />} />
								<Route path="messages" element={<Messages />} />
								<Route path="vans" element={<HostVans />} />
								<Route path="vans/new" element={<AddVan />} />
								<Route path="vans/:id" element={<HostVanDetail />}>
									<Route index element={<HostVanInfo />} />
									<Route path="pricing" element={<HostVanPricing />} />
									<Route path="photos" element={<HostVanPhotos />} />
								</Route>
							</Route>
						</Route>
						
						<Route path="*" element={<NotFound />}/>
					</Route>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	)
}

export default App;