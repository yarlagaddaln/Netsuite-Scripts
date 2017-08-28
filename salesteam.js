function opp_load_salesrep(type){
	if(type ==='edit'||type ==='copy'){
		var salesteam_count = nlapiGetLineItemCount('salesteam');
		if(salesteam_count<=3){
			for(i=1;i<=salesteam_count;i++){
				set_sales_rep = nlapiGetLineItemValue('salesteam','employee',i);
				if(i==1){
						nlapiSetFieldValue('custbody34',set_sales_rep);
				}
				if(i==2){
					nlapiSetFieldValue('custbody35',set_sales_rep);
				}
				if(i==3){
					nlapiSetFieldValue('custbody36',set_sales_rep);
				}
			}
		}
		
	}
	
}

function Salesrep_add(type)
{
   // Execute this code when all the fields from item are sourced on the Sales team on Opportunity.
	var default_sales_team_count = 3;
	var current_line_num = nlapiGetCurrentLineItemIndex(type, name);
	var set_sales_rep = '';

		if (type == 'salesteam') {
			// treshold value for the no of persons per an opportunity is set to 3 by default
			var current_sales_team_count = nlapiGetLineItemCount('salesteam', 'employee');
			if (current_sales_team_count <= default_sales_team_count && current_line_num <= default_sales_team_count) {

				if (current_line_num == 1) {
					set_sales_rep = nlapiGetCurrentLineItemValue('salesteam', 'employee');
					nlapiSetFieldValue('custbody34', set_sales_rep);
				}
				if (current_line_num == 2) {
					set_sales_rep = nlapiGetCurrentLineItemValue('salesteam', 'employee');
					nlapiSetFieldValue('custbody35', set_sales_rep);
				}
				if (current_line_num == 3) {
					set_sales_rep = nlapiGetCurrentLineItemValue('salesteam', 'employee');
					nlapiSetFieldValue('custbody36', set_sales_rep);
				}
			}
			
		} else {
			
		}
		return true;
}

function Salesrep_change(type){
	if(type === 'salesteam'){
		
		var current_line_num = nlapiGetCurrentLineItemIndex(type,'employee');
		if(current_line_num == 1){
					nlapiSetFieldValue('custbody34','');
				}
				if(current_line_num == 2){
					set_sales_rep = nlapiGetCurrentLineItemValue('salesteam','employee');
					nlapiSetFieldValue('custbody35','');
				}
				if(current_line_num == 3){
					set_sales_rep = nlapiGetCurrentLineItemValue('salesteam','employee');
					nlapiSetFieldValue('custbody36','');
				}
		
	}
	return true;
}

