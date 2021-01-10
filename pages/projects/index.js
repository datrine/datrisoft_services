import Header from "../../components/Header";
import styles from '../../public/projects.module.css'
import Link from 'next/link'

const Project = () => (<div>
    <Header />
    <h2 className={styles.header}>Our Projects</h2>
    <div className={styles.flex}>
    <div className={styles.card}>
        <Link href="https://medikedu.com">
            <a style={{textDecoration:"none"}}>
                <h3>Medikedu</h3>
                <p>First E-Learning Platform for Medical Doctors and students in Africa</p>
            </a>
        </Link>
    </div>
    </div>
</div>)




export default Project