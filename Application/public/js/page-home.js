// home page (mainly for logging in)

import {
    Validator
} from "/core/index.js";

import GeneralUI from "./utilities/general-ui.js";

import { initAuth, signInWithGoogle } from "./firebase.js";


// [[ Variables ]] //
var user = await initAuth();
var playerId = user?.uid;



// [[ Functions ]] //

function initialiseSignIn() {
    let signInBtn = document.getElementById("sign-in-google");

    signInBtn.addEventListener("click", async (e) => {
        if (user.isAnonymous) {
            try {
                let result = await signInWithGoogle();
                
                if (result) {
                    user = result;
                    playerId = user.uid;

                    window.location.reload();
                }

                GeneralUI.createToast("Sign In Successful",
                    "Successfully signed into Google!",
                    "#0A0");

            } catch (error) {
                console.log(error);

                GeneralUI.createToast("Sign In Failure",
                    "Something went wrong when trying to sign in",
                    "#59F");
            }

        } else {
            GeneralUI.createToast("Sign In Cancelled",
                "You're already signed in!",
                "#F90");
        }
    });

    if (!user.isAnonymous) {
        signInBtn.querySelector("span").innerHTML = "Signed in with Google";
        signInBtn.querySelector("i").dataset.lucide = "user-check";
    } 
}



// [[ Set Up ]] //

initialiseSignIn();

lucide.createIcons();