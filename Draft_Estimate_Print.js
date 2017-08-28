function beforeLoad_print(type, form, request){

      if (type == "view"){

          form.addButton('custpage_print1', 'Print Estimate', 'testprint()');
          form.setScript('customscript273'); // this is the value of the User Event script's ID 
      } 
}

