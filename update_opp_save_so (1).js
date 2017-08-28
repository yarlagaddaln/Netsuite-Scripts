function update_opp_save_est(type){
//get the opp number after save
 //Obtain a handle to the newly created so record
    var soRec = nlapiGetNewRecord();
var opp_num = soRec.getFieldValue('custbody_linked_opportunity');
var optout_status = soRec.getFieldValue('custbody_opt_out');
//update opp if opp number is available
if(opp_num){
	try
      {
        //committing the field to the opp record
	nlapiSubmitField('opportunity', opp_num, 'custbody_opt_outfield', optout_status);
	  }
	  catch (e)
      {
        nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
      }
}

}