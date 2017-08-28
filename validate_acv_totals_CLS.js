function ACV_FEILD_CHANGE(type, name) {
	var field_name = name;
	var regex = /\d+/g;
	var string = field_name;
	var id_num = '';
	id_num = parseInt(string.match(regex)); // get the id of the field changed
	var id_name = field_name.replace(/[0-9]/g, '');
	//making sure that script works only for new,upsell,renewal,contract
	var field_defaults = ["custrecord_macv_new_id", "custrecord_macv_renewal_id", "custrecord_macv_upsell_id", "custrecord_macv_cont_upsell_id", "custrecord_macv_cancel_id", "custrecord_macv_shrinkage_id","custrecord_macv_discount_id"];
	var validaity = field_defaults.indexOf(id_name);
	var new_totals = 0;
	var renewal_totals = 0;
	var upsell_totals = 0;
	var contract_upsell_totals = 0;
	var cancel_totals = 0;
	var shrinkage_totals = 0;
	var year_total = 0;
	var aggregate_total = 0;
	var discounts_total=0;

	//this works only when an of array fields are changed only

	if (validaity != -1) {
		new_totals = Number(nlapiGetFieldValue('custrecord_macv_new_id1')) + Number(nlapiGetFieldValue('custrecord_macv_new_id2')) + Number(nlapiGetFieldValue('custrecord_macv_new_id3'))+Number(nlapiGetFieldValue('custrecord_macv_new_id4'));
		renewal_totals = Number(nlapiGetFieldValue('custrecord_macv_renewal_id1')) + Number(nlapiGetFieldValue('custrecord_macv_renewal_id2')) +Number(nlapiGetFieldValue('custrecord_macv_renewal_id3'))+Number(nlapiGetFieldValue('custrecord_macv_renewal_id4'));
		upsell_totals = Number(nlapiGetFieldValue('custrecord_macv_upsell_id1')) + Number(nlapiGetFieldValue('custrecord_macv_upsell_id2')) +Number(nlapiGetFieldValue('custrecord_macv_upsell_id3'))+Number(nlapiGetFieldValue('custrecord_macv_upsell_id4'));
		contract_upsell_totals = Number(nlapiGetFieldValue('custrecord_macv_cont_upsell_id1')) + Number(nlapiGetFieldValue('custrecord_macv_cont_upsell_id2')) +Number(nlapiGetFieldValue('custrecord_macv_cont_upsell_id3'))+Number(nlapiGetFieldValue('custrecord_macv_cont_upsell_id4'));
		cancel_totals = Number(nlapiGetFieldValue('custrecord_macv_cancel_id1')) +Number(nlapiGetFieldValue('custrecord_macv_cancel_id2')) + Number(nlapiGetFieldValue('custrecord_macv_cancel_id3'))+Number(nlapiGetFieldValue('custrecord_macv_cancel_id4'));
		shrinkage_totals = Number(nlapiGetFieldValue('custrecord_macv_shrinkage_id1')) + Number(nlapiGetFieldValue('custrecord_macv_shrinkage_id2')) + Number(nlapiGetFieldValue('custrecord_macv_shrinkage_id3'))+Number(nlapiGetFieldValue('custrecord_macv_shrinkage_id4'));

		//SETTING TOTAL VALUES ON FIELDS IF ANY CHANGES
	 	nlapiSetFieldValue('custrecord_macv_new_total', parseFloat(new_totals));
		nlapiSetFieldValue('custrecord_macv_renewal_total', parseFloat(renewal_totals));
		nlapiSetFieldValue('custrecord_macv_upsell_total', parseFloat(upsell_totals));
		nlapiSetFieldValue('custrecord_macv_cont_upsell_total', parseFloat(contract_upsell_totals));
		nlapiSetFieldValue('custrecord_macv_cancel_total', parseFloat(cancel_totals));
		nlapiSetFieldValue('custrecord_macv_shrinkage_total', parseFloat(shrinkage_totals)); 

		//setting total based on year

		year_total = Number(nlapiGetFieldValue('custrecord_macv_new_id'+id_num)) + Number(nlapiGetFieldValue('custrecord_macv_renewal_id'+id_num)) + Number(nlapiGetFieldValue('custrecord_macv_upsell_id'+id_num)) + Number(nlapiGetFieldValue('custrecord_macv_cont_upsell_id'+id_num))- Number(nlapiGetFieldValue('custrecord_macv_cancel_id'+id_num)) - Number(nlapiGetFieldValue('custrecord_macv_shrinkage_id'+id_num));
		//alert(year_total.toFixed(2));
		//alert(nlapiGetFieldValue('custrecord_macv_total_acv_id'+id_num));
		nlapiSetFieldValue('custrecord_macv_total_acv_id'+id_num,year_total.toFixed(2)); 

		//setting the total aggregate
		 aggregate_total =Number(nlapiGetFieldValue('custrecord_macv_total_acv_id1'))+Number(nlapiGetFieldValue('custrecord_macv_total_acv_id2'))+Number(nlapiGetFieldValue('custrecord_macv_total_acv_id3'))+Number(nlapiGetFieldValue('custrecord_macv_total_acv_id4'));
		nlapiSetFieldValue('custrecord_macv_mast_total_acv', aggregate_total.toFixed(2));
		
		//discounts
		discounts_total = Number(nlapiGetFieldValue('custrecord_macv_discount_id1'))+Number(nlapiGetFieldValue('custrecord_macv_discount_id2'))+Number(nlapiGetFieldValue('custrecord_macv_discount_id3'))+Number(nlapiGetFieldValue('custrecord_macv_discount_id4'));
		nlapiSetFieldValue('custrecord_macv_discount_total', discounts_total.toFixed(2));
	}


}

function Calculate_totals_acv(type){
    var new_totals = 0;
	var renewal_totals = 0;
	var upsell_totals = 0;
	var contract_upsell_totals = 0;
	var cancel_totals = 0;
	var shrinkage_totals = 0;
	var year_total = 0;
	var aggregate_total = 0;
	var discounts_total=0;
			new_totals = Number(nlapiGetFieldValue('custrecord_macv_new_id1')) + Number(nlapiGetFieldValue('custrecord_macv_new_id2')) + Number(nlapiGetFieldValue('custrecord_macv_new_id3'));
		renewal_totals = Number(nlapiGetFieldValue('custrecord_macv_renewal_id1')) + Number(nlapiGetFieldValue('custrecord_macv_renewal_id2')) +Number(nlapiGetFieldValue('custrecord_macv_renewal_id3'));
		upsell_totals = Number(nlapiGetFieldValue('custrecord_macv_upsell_id1')) + Number(nlapiGetFieldValue('custrecord_macv_upsell_id2')) +Number(nlapiGetFieldValue('custrecord_macv_upsell_id3'));
		contract_upsell_totals = Number(nlapiGetFieldValue('custrecord_macv_cont_upsell_id1')) + Number(nlapiGetFieldValue('custrecord_macv_cont_upsell_id2')) +Number(nlapiGetFieldValue('custrecord_macv_cont_upsell_id3'));
		cancel_totals = Number(nlapiGetFieldValue('custrecord_macv_cancel_id1')) +Number(nlapiGetFieldValue('custrecord_macv_cancel_id2')) + Number(nlapiGetFieldValue('custrecord_macv_cancel_id3'));
		shrinkage_totals = Number(nlapiGetFieldValue('custrecord_macv_shrinkage_id1')) + Number(nlapiGetFieldValue('custrecord_macv_shrinkage_id2')) + Number(nlapiGetFieldValue('custrecord_macv_shrinkage_id3'));

		//SETTING TOTAL VALUES ON FIELDS IF ANY CHANGES
	 	nlapiSetFieldValue('custrecord_macv_new_total', parseFloat(new_totals));
		nlapiSetFieldValue('custrecord_macv_renewal_total', parseFloat(renewal_totals));
		nlapiSetFieldValue('custrecord_macv_upsell_total', parseFloat(upsell_totals));
		nlapiSetFieldValue('custrecord_macv_cont_upsell_total', parseFloat(contract_upsell_totals));
		nlapiSetFieldValue('custrecord_macv_cancel_total', parseFloat(cancel_totals));
		nlapiSetFieldValue('custrecord_macv_shrinkage_total', parseFloat(shrinkage_totals)); 
		
        // decomposing the deal based on the years
        var deal_start = nlapiGetFieldValue('custrecord_macv_start_date');
        var deal_end = nlapiGetFieldValue('custrecord_macv_end_date');
        var diff_between_deals = '';
        if (deal_start && deal_end) {
            var startdate = new Date(deal_start).getTime();
            var enddate = new Date(deal_end).getTime();
            diff_between_deals = Math.abs(startdate - enddate) / (24 * 60 * 60 * 1000);
            //nlapiLogExecution('DEBUG', 'Years', 'Years = ' + Math.abs(startdate - enddate) / (24 * 60 * 60 * 1000));
        }
        if (diff_between_deals <= 366) {
            deal_no_of_years = 1;
        } else if (diff_between_deals <= 731 && diff_between_deals > 366) {
            deal_no_of_years = 2;
        } else if (diff_between_deals <= 1097 && diff_between_deals > 731) {
            deal_no_of_years = 3;
        } else if (diff_between_deals <= 1462 && diff_between_deals > 1097) {
            deal_no_of_years = 4;
        }
		for(i=1;i<=deal_no_of_years;i++){
			//setting total based on year

		year_total = Number(nlapiGetFieldValue('custrecord_macv_new_id'+i)) + Number(nlapiGetFieldValue('custrecord_macv_renewal_id'+i)) + Number(nlapiGetFieldValue('custrecord_macv_upsell_id'+i)) + Number(nlapiGetFieldValue('custrecord_macv_cont_upsell_id'+i))- Number(nlapiGetFieldValue('custrecord_macv_cancel_id'+i)) - Number(nlapiGetFieldValue('custrecord_macv_shrinkage_id'+i));
		//alert(year_total.toFixed(2));
		//alert(nlapiGetFieldValue('custrecord_macv_total_acv_id'+id_num));
		nlapiSetFieldValue('custrecord_macv_total_acv_id'+i,year_total.toFixed(2)); 

		//setting the total aggregate
		 aggregate_total =Number(nlapiGetFieldValue('custrecord_macv_total_acv_id1'))+Number(nlapiGetFieldValue('custrecord_macv_total_acv_id2'))+Number(nlapiGetFieldValue('custrecord_macv_total_acv_id3'));
		nlapiSetFieldValue('custrecord_macv_mast_total_acv', aggregate_total.toFixed(2));
		
		//discounts
		discounts_total = Number(nlapiGetFieldValue('custrecord_macv_discount_id1'))+Number(nlapiGetFieldValue('custrecord_macv_discount_id2'))+Number(nlapiGetFieldValue('custrecord_macv_discount_id3'));
		nlapiSetFieldValue('custrecord_macv_discount_total', discounts_total.toFixed(2));
		
		}
		}
		

		
		
		
