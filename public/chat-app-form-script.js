//image component 
let FormImage = () => {
  return (
    <div id="img-container">
      <img src="http://cdni.iconscout.com/illustration/free/preview/sign-up-form-4575543-3798675.png?w=0&h=700" alt="signup-form" />
      <div id="circle-top"></div>
      <div id="circle-bottom"></div>
      <div id="animated-block">Login</div> 
    </div>
  );
};

//SignUp Component
let SignUp = (props) => {
  return (
    <form id="signUp-form-container" onSubmit={props.submission} autoComplete="off">
      <div id="signUp-header">Sign-Up<br/>
        <span className="create-account-text">Let's create your account</span>
      </div> 
      <div id="info-section">
        <div id="name-section">
          <label htmlFor="username">Username</label>
          <input id="username" type="text" name="username"/>
          <i className="fa-solid fa-circle-user"></i>
          <div className="username error"></div>
        </div>
        <div id="email-section">
          <label htmlFor="user-email">Email</label>
          <input id="user-email" type="email" name="email" />
          <i className="fa-solid fa-envelope"></i>
          <div className="email error"></div>
        </div>
        <div id="create-password-section">
          <label htmlFor="user-password">Password</label>
          <input id="user-password" type="password" name="password" />
          <i onClick={props.visibility} className="fas fa-eye-slash"></i>
          <div className="password error"></div>
        </div>
        <div id="confirm-pass-section">
          <label htmlFor="confirm-password">Confirm</label>
          <input id="confirm-password" type="password" />
          <i onClick={props.visibility} className="fas fa-eye-slash"></i>
          <div className="confirm-password error"></div>
        </div>
       </div>
      <div id="submit-button">
        <button type="submit">Submit</button>
      </div>
      <div id="logIn-text">Already have an account? <a href="#" onClick={props.changeForm}>Log In!</a></div>
    </form>
  )
};

//LogIn Component
let LogIn = (props) => {
  return (
    <form id="logIn-form-container" onSubmit={props.login} autoComplete="off">
      <div id="logIn-header">
        <h1 id="logIn-title">Log-In</h1>
        <p id="create-account-link">New User? <a href="#" onClick={props.changeForm}>Create an account.</a></p>
      </div>
      <div id="logIn-details">
        <div id="logIn-email">
          <label htmlFor="email-address">Email</label>
          <input type="email" id="email-address" name="email" required />
          <i className="fa-solid fa-envelope"></i>
          <div className="email error"></div>
        </div>
        <div id="logIn-password">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" />
          <i onClick={props.visibility} className="fas fa-eye-slash"></i>
          <div className="password error"></div>
        </div>
      </div>
      <div id="logIn-button">
        <button type="submit">Login</button>
      </div>
      <div id="google-button">
        <p id="or">Or</p>
        <a href={`http://${window.location.hostname}:3000/auth/google`} id="google-logIn-button"><i className="fa-brands fa-google"></i>&nbsp;Login in with Google</a>
      </div>
    </form>
  )
}


class FormContainer extends React.Component {
   constructor(props) {
     super(props);
     this.formChanger = this.formChanger.bind(this);
     this.passwordVisibilityToggle = this.passwordVisibilityToggle.bind(this);
     this.formSubmission = this.formSubmission.bind(this);
     this.loginHandler = this.loginHandler.bind(this);

     this.state = {
       formType: "signup",
       passwordVisibility: false,
       formSubmission: ""
     };
   }
    
   formChanger(event) {
     let signupPage = document.getElementById("signUp-form-container");
     let loginPage = document.getElementById("logIn-form-container");
     let animatedBlock = document.getElementById("animated-block");
     if(event.target.textContent === "Log In!") {
            this.setState({
              formType: "login"
            })
            loginPage.classList.remove('slide-down');
            animatedBlock.textContent = "Login";
     } else {
           this.setState({
             formType: "signup"
           });
          loginPage.classList.add('slide-down');
           animatedBlock.textContent = "Hello";
     }
   }

   passwordVisibilityToggle(event) {
     let passwordField = event.target.previousElementSibling;
     let passwordIcon = event.target;
     if(passwordField.type === "password") {
       this.setState({passwordVisibility: true});
       passwordField.type = "text";
       passwordIcon.className = "fas fa-eye";
     } else {
       this.setState({passwordVisibility: false});
       passwordField.type = "password";
       passwordIcon.className = "fas fa-eye-slash";
      }
    }
    
    formSubmission(event) {
      event.preventDefault();
      let form = document.getElementById("signUp-form-container");
      let errorContainers = document.querySelectorAll('.error');
      let httpRequest = new XMLHttpRequest();
      let userPassword = document.getElementById("user-password");
      let confirmPassword = document.getElementById("confirm-password");
      let confirmPasswordErrDiv = document.querySelector(".confirm-password");
      let passwordErrDiv = document.querySelector(".password");

      //reset text content of error containers
      for (let errDiv of errorContainers) {
        errDiv.textContent = "";
      }

      //created an array of nested arrays each having a key/value pair as items from a form data object
      let arrOfFormData = Array.from(new FormData(form));
      let formDataObj = {};
      
      //used for loop to extract values from nested arrays inside the array("arrOfFormData")
      for (let nestedArr of arrOfFormData) {
        formDataObj[nestedArr[0]] = nestedArr[1];
      }

      //confirm password
      if(userPassword.value !== "" && passwordErrDiv.textContent === "") {
        if(userPassword.value !== confirmPassword.value) {
          confirmPasswordErrDiv.textContent = "The password doesn't match.";
        }
      } 
      if(confirmPasswordErrDiv.textContent === "") {
       httpRequest.open('POST', `http://${window.location.hostname}:3000/form`, true);
       httpRequest.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
       httpRequest.send(JSON.stringify(formDataObj));
       httpRequest.onload = function() {
         if(httpRequest.readyState === 4 && httpRequest.status === 401) {
           let errorObject = JSON.parse(httpRequest.responseText);
           let errorObjectKeys = Object.keys(errorObject);

           for (let key of errorObjectKeys) {
             let element = document.querySelector(`.${key}`);
             element.textContent = errorObject[key];
           }
         } 
         if(httpRequest.readyState === 4 && httpRequest.status === 200) {
           let loginText = document.getElementById("logIn-text");
           let anchorElement = loginText.firstElementChild;
           for(let formElement of form.elements) {
             if(formElement.id !== "") {
               formElement.value = "";
             }
           }
  
           //event triggered on anchorElement 
           anchorElement.click();
         } 
        }
      }
    }

   loginHandler(event) {
     event.preventDefault();
     let loginForm = document.getElementById("logIn-form-container");
     let emailErr = document.getElementById("logIn-email").lastElementChild;
     let passwordErr = document.getElementById("logIn-password").lastElementChild;
     let loginData = {
       email: loginForm.email.value,
       password: loginForm.password.value 
     }
     let httpRequest = new XMLHttpRequest();

     emailErr.textContent = "";
     passwordErr.textContent = "";
     httpRequest.open("POST", `http://${window.location.hostname}:3000/login`, true);
     httpRequest.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
     httpRequest.send(JSON.stringify(loginData));
     httpRequest.onload = function(event) {
       if(httpRequest.readyState === 4 && httpRequest.status === 200) {
         window.location.href = `http://${window.location.hostname}:3000/homepage`;
       } else {
         let errorObj = JSON.parse(httpRequest.responseText);
        //passing error data to elements received as json response
         emailErr.textContent = errorObj.email;
         passwordErr.textContent = errorObj.password;
       }
     }
  }

   render() {
    return (
        <div id="form-container">
          <SignUp changeForm={this.formChanger} visibility={this.passwordVisibilityToggle} submission={this.formSubmission} />
          <LogIn changeForm={this.formChanger} visibility={this.passwordVisibilityToggle} login={this.loginHandler}/>
          <FormImage />
        </div>
       )   
     } 
   };

ReactDOM.render(<FormContainer />, document.getElementById("react-container"));