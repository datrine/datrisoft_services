import Link from 'next/link'
import {useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const Header=()=>(<div>
<CollapsibleMenu/>
</div>)

//component for expanded view of the collapsible menu
function Links({ userData, autoCollapseParent }) {
    return (<nav style={{ position: "fixed", top: 0 }}>
        <ul className="header">
            <li>
                <Link to='/' onBlur={(e) => {
                    console.log("/home")
                    autoCollapseParent(true)
                }}>Home</Link>
            </li>
            <li>
                <Link to='/about' onBlur={(e) => {
                    console.log("/about")
                    autoCollapseParent(true)
                }}>About</Link>
            </li>
            <li>
                {userData ? <Link to="/logout" onBlur={(e) => {
                    console.log("/log (in or out)")
                    autoCollapseParent(true)
                }}>Log out</Link> : <Link to='/login'>Log in</Link>}
            </li>
        </ul>
    </nav>)
}

//component for the collapsible menu
function CollapsibleMenu() {
    let [isCollapsed, autoCollapse] = useState(true)
    let timeId;
    let handleCollapseBtnClick = (e) =>
        autoCollapse(!isCollapsed)
    let handleOnBlur = (e) => autoCollapse(true)
    let collapseBtn = <button style={{ position: "absolute", top: 0 }} className="w3-btn w3-text-blue"
        onClick={handleCollapseBtnClick}>
        <FontAwesomeIcon icon={faTimes} /></button>
    let expandBtn = <button style={{ position: "absolute", top: 0 }}
        className="w3-btn w3-text-blue" onClick={handleCollapseBtnClick}>
        <FontAwesomeIcon icon={faBars} /></button>
    return isCollapsed ? (<div>{expandBtn}</div>) : (
        <div className="fullOverlay" onClick={handleOnBlur}>
            <div style={{ zIndex: "1000" }}>
                {collapseBtn}
                <Links autoCollapseParent={autoCollapse} />
            </div>
        </div>)
}

export default Header;