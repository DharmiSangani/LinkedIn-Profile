import React from "react";
import { signOut } from "aws-amplify/auth";
import { Button } from "@aws-amplify/ui-react";

const SignOut = () => {
  const handleSignOut = async () => {
    try {
      await signOut(); 
      window.location.reload();
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* <h2>You are signed in!</h2> */}
      <Button variation="primary" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
};

export default SignOut;
