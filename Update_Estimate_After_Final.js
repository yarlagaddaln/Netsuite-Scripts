function Alert_User(s) {

               /*
                 * return true|false line is required to allow/disallow the workflow action to execute.
                 * Condition will treat the function returned false if this line is omitted.
                 * Thus, Workflow Action (e.g. Set Field Value) will not execute
               */
			   if (confirm("Press a button!") == true) {
        return true;
    } else {
        return false ;
    }
              
          }
