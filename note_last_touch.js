function Before_Note_Add(type,form){
		
			// Native Javascript Date Object.
var date = new Date(); 

var get_user = nlapiGetContext();

var current_role = get_user.getRole();
var current_user = get_user.getUser();

var c_current_year = date.getFullYear();
var c_current_month = date.getMonth();
var c_current_day = date.getDate();
date = c_current_month+'/'+c_current_day+'/'+c_current_year;

/* if(current_role!=3){
	
} */
	//set the last update by and last update fields
	nlapiSetFieldValue('custrecord_note_created_updated',date);
	nlapiSetFieldValue('custrecord_note_created_updated_by',current_user);

}

function After_Note_Added(type, form){
	  var Note_Rec = nlapiGetNewRecord();
	var opp_id = Note_Rec.getFieldValue('custrecord_opp_no');
	var date = Note_Rec.getFieldValue('custrecord_note_created_updated');
	var current_user = Note_Rec.getFieldValue('custrecord_note_created_updated_by');
	var opp_load = nlapiLoadRecord('opportunity',opp_id);
	var i = opp_load.getLineItemCount('salesteam');
 	try{
	for(var k = 1; k <= i; k++){
		nlapiLogExecution('DEBUG', 'primary rep: '+  opp_load.getLineItemValue('salesteam','isprimary',k));
		if((current_user!= opp_load.getLineItemValue('salesteam','employee',k))&& opp_load.getLineItemValue('salesteam','isprimary',k)=='T'){
			nlapiLogExecution('DEBUG', 'primary: '+  opp_load.getLineItemValue('salesteam','employee',k));
		}
		else{
			nlapiLogExecution('DEBUG', 'current: '+ current_user);
		}
	}
	nlapiSubmitField('opportunity',opp_id, 'custbody_opp_note_updated_created', date);
	nlapiSubmitField('opportunity', opp_id, 'custbody_opp_note_created_updated_by', current_user);
  }
  catch(err){
    nlapiLogExecution('DEBUG', 'Error'+err);
  } 
		
}