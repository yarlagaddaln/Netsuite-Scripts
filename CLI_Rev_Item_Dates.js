function add_rev_date_default(){
	var original_sdate = nlapiGetFieldValue('startdate');
	var original_edate = nlapiGetFieldValue('enddate');
	 var item_count = nlapiGetLineItemCount('item');
	

		 for(i=1;i<=item_count;i++){
			 if(nlapiGetLineItemValue('item', 'custcol_revenue_start_date',i)=='' || nlapiGetLineItemValue('item', 'custcol_revenue_end_date',i)==''){
			nlapiSetLineItemValue('item', 'custcol_revenue_start_date',i,original_sdate);
			nlapiSetLineItemValue('item', 'custcol_revenue_end_date',i,original_edate);
		}
		 }
	return true;
}

function add_rev_date(type){
	var item_change_status_start = nlapiIsLineItemChanged('item','custcol_revenue_start_date');
	var item_change_status_end = nlapiIsLineItemChanged('item','custcol_revenue_end_date');
	var item_count = nlapiGetLineItemCount('item');
	var rev_start_date = nlapiGetLineItemValue('item', 'custcol_revenue_start_date');
		if(!rev_start_date){
			 rev_start_date = nlapiGetFieldValue('startdate');
			
		}
		var rev_end_date = nlapiGetLineItemValue('item', 'custcol_revenue_end_date');
		if(!rev_end_date){
			 rev_end_date = nlapiGetFieldValue('enddate');
		}
	
	var after_edit_startdate = nlapiGetCurrentLineItemValue('item', 'custcol_revenue_start_date');
	var after_edit_enddate = nlapiGetCurrentLineItemValue('item', 'custcol_revenue_end_date');
	
	var orig_start_date = new Date(rev_start_date).toDateString("MM/dd/yyyy");
	var orig_end_date = new Date(rev_end_date).toDateString("MM/dd/yyyy");
	var edit_start_date = new Date(after_edit_startdate).toDateString("MM/dd/yyyy");
	var edit_end_date = new Date(after_edit_enddate).toDateString("MM/dd/yyyy");
	if(item_change_status_start==true && item_change_status_end==true){
		//both dates are not changed 
		if(orig_start_date!=edit_start_date && orig_end_date!=edit_end_date){
		if(!after_edit_startdate && !after_edit_enddate){
			nlapiSetCurrentLineItemValue('item', 'custcol_revenue_start_date', rev_start_date, true, true);
			nlapiSetCurrentLineItemValue('item', 'custcol_revenue_end_date', rev_end_date, true, true);
		}
		else{
			nlapiSetCurrentLineItemValue('item', 'custcol_revenue_start_date', after_edit_startdate, true, true);
			nlapiSetCurrentLineItemValue('item', 'custcol_revenue_end_date', after_edit_enddate, true, true);
		}
		
		}
		//only start date changed
		else if(orig_start_date!=edit_start_date){
			nlapiSetCurrentLineItemValue('item', 'custcol_revenue_start_date', after_edit_startdate, true, true);
		}
		//only end date changed
		else if(orig_end_date!=edit_end_date){
			nlapiSetCurrentLineItemValue('item', 'custcol_revenue_end_date', after_edit_enddate, true, true);
		}
	}
	return true;
}