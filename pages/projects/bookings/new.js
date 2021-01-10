import React, { useEffect, useState, useRef } from 'react'
import Header from '../../../components/Header'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import styles from '../../../public/createNewProject.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import parse from 'html-react-parser'
import moment from 'moment'
import Link from 'next/link'
import { validClient } from '../../../utils/validators'
import useSWR from 'swr'
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
    ssr: false,
    loading: () => <p>...</p>
});
let project = {
    name: '',
    desc: '',
    dateOfLast: undefined
}
let tinyMceApiKey = "vsa12p9bzdtlt2da8n4vcx2vsgqdvut4ttre8ypppisnz6jw"

export default function New() {
    return (<div>
        <Head>
            <title>Create New Project</title>
        </Head>
        <Header />

        <HOC
            compObjs={[NameOfProject, DescriptionOfProject, DateMaxOfProject,
                OwnerDetails, Review, SuccessView, FailureView]}
            startComponent={NameOfProject} />
    </div>)
}

function HOC({ compObjs = [], startComponent, ...props }) {
    compObjs = compObjs.map((Component, id) => ({ Component, id }))
    let [components, updateComponents] = useState([...compObjs])
    let [nextBtnDisabled, toggleNextBtnDisable] = useState(false);
    let [prevBtnDisabled, togglePrevBtnDisable] = useState(false);
    let [nextBtnShow, toggleNextBtnShow] = useState(true);
    let [prevBtnShow, togglePrevBtnShow] = useState(true);
    let entryCompObj = components.find((obj) => obj.Component.name === startComponent.name) ||
        components[0];
    let [curCompObj, updateCurCompObj] = useState(entryCompObj);
    useEffect(() => {
        console.log("Component changed to " + curCompObj.Component.name + " id " + curCompObj.id);
    }, [curCompObj.id, curCompObj.Component.name])
    let CompToView = curCompObj.Component;
    let handlePrev = (e) => {
        if (curCompObj.id > 0) {
            let nextCompObj = components[curCompObj.id - 1];
            //if next component is OwnerDetails, check if creatorEmail and creatorId
            if (nextCompObj.Component.name === "OwnerDetails" && project.creatorEmail && project.creatorId) {
                nextCompObj = components[nextCompObj.id - 1];
            }
            updateCurCompObj(nextCompObj)
        }
    }

    let handleNext = (e) => {
        if (curCompObj.id < components.length - 1) {
            let nextCompObj = components[curCompObj.id + 1];
            //if next component is OwnerDetails, check if creatorEmail and creatorId
            if (nextCompObj.Component.name === "OwnerDetails" && project.creatorEmail && project.creatorId) {
                nextCompObj = components[nextCompObj.id + 1];
            }
            console.log(nextCompObj)
            updateCurCompObj(nextCompObj)
        }
    }
    return (<div >
        <p className={styles.description}>
            Datrisoft... Tech for the future...
        </p>
        <div className={styles.container}>
            <CompToView key={curCompObj.id} project={project} handleNext={handleNext} handlePrev={handlePrev}
                toggleNextBtnDisable={toggleNextBtnDisable} togglePrevBtnDisable={togglePrevBtnDisable}
                toggleNextBtnShow={toggleNextBtnShow} togglePrevBtnDisable={togglePrevBtnShow} />
            <div className={styles.divBtn} >
                {(curCompObj.id === 0 || CompToView === OwnerDetails ||
                    CompToView === SuccessView) ? null :
                    <button className={styles.prevBtn} disabled={prevBtnDisabled}
                        onClick={handlePrev}>Previous</button>}
                {(curCompObj.curCompObj === components.length - 1 ||
                    CompToView === OwnerDetails || CompToView === Review
                    || CompToView === SuccessView) ?
                    null : <button className={styles.nextBtn}
                        disabled={nextBtnDisabled} onClick={handleNext}>
                            Next</button>
                }

                {CompToView === Review ? <button className={styles.saveBtn} onClick={(e) => {
                    //
                    saveProject({ project }).then(savedProject => {
                        let nextCompObj =
                            components.find((compObj) =>
                                compObj.Component === SuccessView)
                        console.log(nextCompObj)
                        updateCurCompObj(nextCompObj)
                    }).catch(err => {
                        let nextCompObj =
                            components.find((compObj) =>
                                compObj.Component === FailureView)
                        console.log(nextCompObj)
                        updateCurCompObj(nextCompObj)
                    })
                }}>Save</button> : null}
            </div>
        </div>
    </div>)
}

function SubView() {
    return <div><p></p></div>
}

function OwnerDetails({ project, handleNext }) {
    if (!project.email) {
        let [newClient, changeNewClient] = useState({})
        let [loginClient, changeLoginClient] = useState({ email: '', password: '' })
        let [recoveryClient, changeRecoveryClient] = useState({ email: '' })
        let [showLogin, toggleShowLogin] = useState(false)
        let [showLoginErr, toggleShowLoginErr] = useState({ show: false, errMsg: '' })
        let [showRegisterErr, toggleShowRegisterErr] = useState({ show: false, errMsg: '' })
        let [showRecoveryView, toggleshowRecoveryView] = useState(false)
        let [canContinue, changeCanContinue] = useState(false)

        let handleInputRecoveryChange = e => {
            changeLoginClient({ email: e.target.value })
        }

        let handleInputLoginChange = e => {
            changeLoginClient({ ...loginClient, [e.target.name]: e.target.value })
        }

        let handleInputRegisterChange = e => {
            changeNewClient({ ...newClient, [e.target.name]: e.target.value })
        }
        if (!canContinue) {
            if (!showRecoveryView) {
                return <>
                    {showLogin ?
                        <div className={styles.divLogin}>
                            <form className={styles.formLogin} onSubmit={
                                e => {
                                    e.preventDefault()
                                    logClientIn(loginClient).then(data => {
                                        project.creatorEmail = data.email
                                        project.creatorId = data.clientId;
                                        changeCanContinue(true)
                                    }).catch(err => {
                                        toggleShowLoginErr({ ...showRegisterErr, errMsg: err.errMsg })
                                    })
                                }}>
                                {showLoginErr.show ? <p style={{ color: "red" }}>{showLoginErr.errMsg}</p> : null}
                                <h4 style={{ textAlign: "center" }}>Log in</h4>
                                <input name="email" className={styles.inputForm} value={loginClient.email}
                                    onChange={handleInputLoginChange} placeholder="Email" type="email" />
                                <input name="password" className={styles.inputForm} value={loginClient.password}
                                    onChange={handleInputLoginChange} placeholder="Password" type="password" />
                                <button className={styles.submitBtn} type="submit">Log in</button>
                                <p>Forget password?<button onClick={
                                    e => {
                                        toggleshowRecoveryView(true)
                                    }
                                }>Recover</button></p>
                                <p>Don't have an account? <button onClick={
                                    e => {
                                        toggleShowLogin(false);
                                    }
                                }>Create one quickly</button></p>
                            </form>
                        </div>
                        :
                        <div className={styles.divRegister}>  <form className={styles.formRegister} onSubmit={e => {
                                e.preventDefault();
                                let { isValid, fname, lname, email, password, phoneNum, address, errMsg } =
                                    validClient({ ...newClient }, { validatePass: true })
                                if (isValid) {
                                    registerNewClient({ fname, lname, email, password, phoneNum, address }).then(data => {
                                        project.creatorEmail = data.email
                                        project.creatorId = data.clientId;
                                        changeCanContinue(true)
                                    }).catch(err => {
                                        toggleShowRegisterErr({ ...showRegisterErr, errMsg: err.errMsg })
                                    })
                                }
                                else {
                                    console.log(errMsg)
                                }
                            }}>
                            <p style={{ textAlign: "center" }}>
                                Looks like you are not logged in.<button onClick={e => {
                                    toggleShowLogin(true);
                                }}><a>Log in</a></button> if you already have an account or quickly register below</p>
                          
                                <h4 style={{ textAlign: "center" }}>Create Account</h4>
                                {showRegisterErr.show ? <p style={{ color: "red" }}>{showRegisterErr.errMsg}</p> : null}
                                <input name="fullname" placeholder="Full name" value={newClient.name} className={styles.inputForm} onChange={handleInputRegisterChange} />
                                <input name="email" placeholder="Email" value={newClient.email} type="email" className={styles.inputForm} onChange={handleInputRegisterChange} />
                                <input name="password" placeholder="Password" value={newClient.password} type="password"
                                    className={styles.inputForm} onChange={handleInputRegisterChange} />
                                <input name="repassword" type="password" placeholder="Repeat password" value={newClient.repassword}
                                    className={styles.inputForm} onChange={handleInputRegisterChange} />

                                <input name="phoneNum" placeholder="Phone number" value={newClient.phoneNum} className={styles.inputForm} onChange={handleInputRegisterChange} />
                                <textarea style={{ display: "none" }} name="address" placeholder="Address" value={newClient.address} className={styles.inputForm} onChange={handleInputRegisterChange} />
                                <button type="submit" className={styles.submitBtn} >Register</button>
                            </form>
                        </div>
                    }</>
            }
            else {
                if (!showLogin) {
                    toggleShowLogin(true);
                }
                return <div className={styles.divLogin}>
                    <form className={styles.formLogin} onSubmit={
                        e => {
                            e.preventDefault()
                            recoverClientPass(recoveryClient)
                        }}>
                        <h4 style={{ textAlign: "center" }}>Log in</h4>
                        <input name="email" className={styles.inputForm} value={loginClient.email}
                            onChange={handleInputRecoveryChange} placeholder="Email" type="email" />
                        <button className={styles.submitBtn} type="submit">Recover Password</button>
                        <p><button onClick={
                            e => {
                                toggleshowRecoveryView(false)
                            }
                        }>Log in</button></p>
                        <p>Don't have an account? <button onClick={
                            e => {
                                toggleshowRecoveryView(false);
                            }
                        }>Create one quickly</button></p>
                    </form>

                </div>
            }
        }
        else {
            return <div><p>Your account has been created.</p>
                <button onClick={handleNext}>Continue</button></div>
        }
    }
}

function FailureView() {
    return <div>
        <h3>Oops</h3>
        <p>Unfortunately we could not save your project right now.</p>
    </div>
}

function NameOfProject({ project, toggleNextBtnDisable, togglePrevBtnDisable }) {
    let [stateName, updateName] = useState(project.name)
    useEffect(() => {
        let disableNext = !(stateName);
        toggleNextBtnDisable(disableNext)

    })
    return <div className={styles.upperDiv}>
        <h3 className={styles.header}>Name Your Project</h3>
        <div>
            <input className={styles.input} value={stateName} onChange={
                (e) => {
                    project.name = e.target.value;
                    updateName(e.target.value)
                }
            } /></div></div>
}

function Review({ project, toggleNextBtnDisable, togglePrevBtnsable }) {
    return <div>
        <p>Name of Project:{project.name}</p>
        <p>Description of Project:{parse(project.desc)}</p>
        <p>Late Date Of Submission:{project.dateOfLast || "Not available"}</p>
    </div>
}

//component to return upon success
function SuccessView({ project }) {
    return <div style={{color:"green"}}>
        <h3>Congrats</h3>
        <p>Your project has been saved.</p>
        <p>We will get back to you ASAP.
    In the time you wait, would you like to <Link href="/projects"><a>tour our project gallery?</a></Link></p>
    </div>
}

function DescriptionOfProject({ project, toggleNextBtnDisable, togglePrevBtnDisable }) {
    let [desc, updateName] = useState(project.desc)
    useEffect(() => {
        let disableNext = !(desc);
        toggleNextBtnDisable(disableNext)

    })
    return <div className={styles.upperDiv}>
        <h3>Describe Your Project</h3>
        <Editor apiKey={tinyMceApiKey} init={{
            height: 400,
            plugins: ['advlist autolink lists link']
        }} onEditorChange={(content, editor) => {
            project.desc = content;
            updateName(project.desc)
        }} />
    </div>
}

function DateMaxOfProject({ project }) {
    let [dateOfLast, updateName] = useState(project.dateOfLast || moment().add(14, 'd').format("YYYY-MM-DD"))
    let min = moment().add(14, 'd').format("YYYY-MM-DD")
    return <div>
        <h3>Select Maximum Date of Completion</h3>
        <input value={dateOfLast} type="date" min={min} onChange={
            (e) => {
                project.dateOfLast = e.target.value;
                updateName(e.target.value)
            }
        } /></div>
}

async function saveProject({ project }) {
    try {
        let res = await fetch("/api/create_project", {
            method: "POST",
            body: JSON.stringify({ project })
        });
        let data = await res.json()
        console.log(data)
        if (data.projectId) {
            return data;
        }
        else {
            throw "unknown error"
        }

    } catch (error) {
        console.error(error)
        return error;
    }
}

async function registerNewClient(newClient) {
    try {
        console.log(newClient)
        let res = await fetch("/api/client/register", {
            method: "POST",
            body: JSON.stringify(newClient)
        });
        let data = await res.json()
        if (data.clientId) {
            return data;
        }
        else {
            console.log(data)
            let err = new Error()
            err.message = data.errMsg
            throw err;
        }

    } catch (error) {
        console.error(error)
        return error;
    }
}

async function logClientIn(loginDet) {
    try {
        console.log(loginDet)
        let res = await fetch("/api/client/login", {
            method: "POST",
            body: JSON.stringify(loginDet)
        });
        let data = await res.json()
        if (data.email) {
            return data;
        }
        else {
            console.log(data)
            let err = new Error()
            err.message = data.errMsg
            throw err;
        }

    } catch (error) {
        console.error(error)
        return error;
    }
}

async function recoverClientPass(recoveryDet) {
    try {
        console.log(recoveryDet)
        let res = await fetch("/api/client/login", {
            method: "POST",
            body: JSON.stringify(recoveryDet)
        });
        let data = await res.json()
        if (data.email) {
            return data;
        }
        else {
            console.log(data)
            let err = new Error()
            err.message = data.errMsg
            throw err;
        }

    } catch (error) {
        console.error(error)
        return error;
    }
}

