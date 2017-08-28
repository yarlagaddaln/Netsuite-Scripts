/* Revision history
*Script Title: Client Script: Remove Commission Amount Value
*Script id: customscript_cs_rmcmsnamt
*Number Date     Author Task
*001    20170624 JK     Remove Commission Amount Value
*/

function rmcmsnamt_changedField(type, name, linenum){
	if(type == "item" && (name == "item" || name == "amount" || name == "rate")){
		nlapiSetCurrentLineItemValue("item", "altsalesamt","");
	}
}

function remove_comission(){
  var item_count = nlapiGetLineItemCount('item');
  
  for(i=1;i<=item_count;i++){
    if(nlapiGetLineItemValue('item', 'item', i)!=1065){
       nlapiSetLineItemValue('item','altsalesamt',i,'');
    }
   
  }
  return true;
}

