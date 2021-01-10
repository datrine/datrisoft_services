import Head from 'next/head';
import Header from "../components/Header";
import styles from "../public/home.module.css"
const Home = () => (
  <div className={styles.container}>
    <Head>
      <title>Datrisoft Landing</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header />
    <main className={styles.main}>
      <h1 className={styles.welcome}>
        Welcome to <a href="https://datrisoft.com">Datrisoft.com</a>
      </h1>
      <p className={styles.description}>
        Datrisoft... Tech for the future...
      </p>

      <div className={styles.grid}>
      <div className={styles.card}>
        <a href="/projects/bookings/new">
          <h3>Book A Project &rarr;</h3>
          <p>Book a project wih us and we will start right away.</p>
        </a></div>

<div className={styles.card}>
        <a href="/projects">
          <h3>View Projects &rarr;</h3>
          <p>View some projects we have undertaken!</p>
        </a>
</div>
<div
          className={styles.card}>
        <a
          href="/our_partners"
        >
          <h3>Partners &rarr;</h3>
          <p>View our list of partners in and beyond the tech world.</p>
        </a>
</div>
<div
          className={styles.card}>
        <a
          href="/careers"
        >
          <h3>Careers &rarr;</h3>
          <p>
            Kickstart your career with us by join the Datrisoft philosophy.
          </p>
        </a>
   </div>   </div>
    </main>

    <footer className={styles.footer}>
      <a
        href="https://www.datrisoft.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by Datrisoft
      </a>
    </footer>

    <style jsx global>{`
      html,
      body {
        padding: 0;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      }

      * {
        box-sizing: border-box;
      }
    `}</style>
  </div>
)

export default Home
