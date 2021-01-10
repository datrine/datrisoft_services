import Link from 'next/link'
import { useState,Fragment } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons'

import styles from './styles/collapsibleButton.module.css'


const Header = () => (<div>
    <CollapsibleMenu />
</div>)

//component for expanded view of the collapsible menu
function Links({ userData, autoCollapseParent }) {
    return (<nav style={{ position: "fixed", top: 0 }}>
        <ul className={styles.linkContainer}>
            <li>
                <Link href='/' >
                    <a className={styles.link} onBlur={(e) => {
                        console.log("/home")
                        autoCollapseParent(true)
                    }}>Home</a>
                </Link>
            </li>
            <li>
                <Link href='/about' >
                <a className={styles.link} onBlur={(e) => {
                    console.log("/about")
                    autoCollapseParent(true)
                }}>About</a></Link>
            </li>
            <li>
                {userData ? <Link href="/logout"><a >Log out</a></Link> :
                    <Link href='/login'>
                    <a className={styles.link} onBlur={(e) => {
                        console.log("/log (in or out)")
                        autoCollapseParent(true)
                    }}>Log in</a></Link>}
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
    let collapsibleBtn = <button style={{ position: "absolute", top: 0 }} className="w3-btn w3-text-blue"
        onClick={handleCollapseBtnClick}>
        <FontAwesomeIcon icon={faTimes} /></button>
    let expandBtn = <button style={{}}
        className="w3-btn w3-text-blue" onClick={handleCollapseBtnClick}>
        <FontAwesomeIcon icon={faBars} /></button>
    return isCollapsed ? (<div className={styles.collapsed}>{expandBtn}</div>) : (
        <div className={styles.fullOverlay} onClick={handleOnBlur}>
            <div className={styles.expanded}>
                {collapsibleBtn}
                <div style={{marginTop:"50px"}}>
                <Links autoCollapseParent={autoCollapse} /></div>
            </div>
        </div>)
}

export default Header;