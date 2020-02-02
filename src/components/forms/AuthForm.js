import React, {useState, useContext} from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

//react hook form is used for validation instead of formik
import { useForm } from 'react-hook-form'

import PrivacyPolicy from '../legal/PrivacyPolicy';

//modal
import Modal from "../modal/modal";
import useModal from "../modal/useModal";

import city from '../../assets/illustrations/city_illustration.jpg'
import {UserContext} from "../../contexts/UserContext"
//oauth button
import './OauthButton'

//styling
import './forms.scss'
import OauthButton from './OauthButton'

//icons
import Google from '../../assets/icons/google.svg'
import Facebook from '../../assets/icons/white-facebook.svg'
import Linkedin from '../../assets/icons/linkedin.svg'

import green_globe from '../../assets/forms/globe_green.svg'
import green_world from '../../assets/forms/world_map.svg'


const AuthForm = props => {

   //list of companies 
   const companies = [{name:'Google', icon: Google},/* {name:'Facebook', icon:Facebook}, */{name:'Linkedin', icon:Linkedin}]

   //state used for react-hook-form
   const {register, handleSubmit, errors} = useForm()

    //state for modal
   const {isShowing, toggle} = useModal();
   const [modalState, setModalState] = useState();

   //const [isLoading, setIsLoading] = useState(false)
   const [validated, setValidated] = useState(false)
   
   const {user, setUser, axiosAuth} = useContext(UserContext)

   const [login, setLogin] = useState({username: '', password: ''})
    const [errorMsg, setErrorMsg] = useState("");    


    const onChange = e => {
        setLogin({...login, [e.target.name] : e.target.value})
        
    }

    const onSubmit = e => {
    
        axios
        .post(`https://citrics-staging.herokuapp.com/api/auth/${props.action.toLowerCase()}`, login)
        .then(res => {
            setUser({...user, ...res.data.user})
            
            
            localStorage.setItem('jwt', res.data.token)

            
            //redirect user to home
            return res.data.user}).then(user => {
            axiosAuth()
            .get(`https://citrics-staging.herokuapp.com/api/users/profile/${user.id}/image`)
            .then(res => {
                if (
                    res.data.length > 0
                    ){
                        setUser({...user, userimage: res.data[0].userimage})
                    }
                    props.history.push('/')
                    // window.location.reload()
                })
                
         })
        .catch(error => {
            if (error.response.status === 500) {
            setErrorMsg("That user already exists.");

          } else if (error.response.status === 401) {
              setErrorMsg("Username or password is invalid")
          } 
          else {console.log(error)}
        }) 
        
}

    return(
            <>
                <Modal
                    isShowing={isShowing}
                    hide={toggle}
                    component={modalState}
                />
           <div className='authForm'>

               {/*Container for left side of forms */}
               <div className="form">

                   <h2 className="formTitle">{(props.action === 'Login') ? 'Welcome Back!' : 'Create Your Account'}</h2>

                    {/*container for auth buttons */}
                   <div className="auth">
                    {
                        //mapping over list of companies defined on line 20
                        companies.map(company => (<OauthButton key={Math.random()} action={props.action} company={company.name} icon={company.icon} />))
                    }  
                   </div>

                   <div className="bottomPortion">
                   
                   <div className="centerText">
                       <div className="line"></div>
                       <p className="center">or with username</p>
                       <div className="line"></div>
                   </div>

                   <form className="fields" onSubmit={handleSubmit(onSubmit)}>
                   
                        {errors.username && errors.username.type === "required" && <p className='formError'>Your username is required</p>} 
                   
                       <input 
                            className="username" 
                            type='text' name='username' 
                            placeholder='username' 
                            // value={login.username} 
                            onChange={onChange}
                            ref={register({
                                required:true, 
                               
                            })}
                        />

                        
                       {errors.password && errors.password.type === 'required' && <p className='formError'>Your password is required</p>}
                       {errors.password && errors.password.type === 'minLength' && <p className='formError'>Passwords must be at least 8 characters long</p>}
                       <input 
                            className="password"
                            type='password'
                            name='password'
                            placeholder="Password"
                            // value={login.password}
                            ref={register({
                                required: true, 
                                minLength : {
                                    value: 8,
                                    message: 'password must be at least 8 characters long'
                                  }
                                })}
                            onChange={onChange}
                        />
                       
                       {errors.pp && <p className="formError">Accepting our privacy policy is required</p>}
                       {    
                            //if user is signing in display privacy policy checkbox
                            
                            (props.action === 'Register') ?  
                            <div className="pp">
                                
                                <input className="checkbox" type="checkbox" name="pp" ref={register({required: true})}></input>
                                <p className="accept-text">
                                    Please accept our 
                                    <span className="ppText" style={{'margin' : '2vw'}} onClick={() => (setModalState(<PrivacyPolicy register={props.register}/>), toggle())} style={{cursor: "pointer"}}> 
                                        privacy policy
                                    </span>
                                </p>
                            </div> 
                        : <div></div>
                        }
                        {errorMsg ? <p className="form-error">{errorMsg}</p> : null}
                        {/* <input type="submit"/> */}
                       <input className={`formButton ${props.action}Button`} value="Start Exploring Cities" type="submit"/>

                       <div className='question'>
                            {
                                (props.action === 'Login') ? 
                                <div><p>Don't have an account?  </p> <Link className='link-authform' to='/signup'>{` Sign up `}</Link> <p>to explore cities</p></div>
                                :
                               <div> <p>Have an account?  </p> <Link className="link-authform" to='/signin'> Login </Link> <p>  to explore cities</p> </div>
                            }
                        </div>
                   </form>
                   
                   </div>
               </div>
                
                {/*Container for photo to be displayed right of form */}
               <div className={`authFormPhoto ${props.action}Photo`}>
                   <img className="loginPhoto" src={(props.action === 'Register') ? green_globe : green_world} alt={`{props.action} photo`}/>
               </div>

           </div>
        </>
        
    )
}

export default AuthForm; 