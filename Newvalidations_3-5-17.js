/****** 
 * @Author Lakshmi 01-20-17. Axioma Bundle description script at line item level
--Add bundle description on line item level that takes up all the line items added on an estimate record 
-- excludes subtotal,total and note descriptions from the Bundle description
-- updates the bundle description upon any line item add or delete or remove operations

******/
function VALIDATE_LINE_ESTIMATE_INIT(type) {
	var get_currentline = parseInt(nlapiGetCurrentLineItemIndex(type));
	 		if(get_currentline==1){
			if(nlapiGetCurrentLineItemValue('item', 'item')==1042){
			alert('Please Add Products to be Bundled');
			return false;
			}
		}
    if (type == 'item') {

        var item_change_status = nlapiIsLineItemChanged('item');
        var item_count = nlapiGetLineItemCount('item');
        var item_desc = '';
        var item_name = nlapiGetLineItemValue('item', 'item', item_count)
        disable_lineitem(type);
        if (item_name == 1042) {

            for (var i = 1; i <= item_count; i++) {

                var item_name = nlapiGetLineItemValue('item', 'item', i);


                if (item_name != 1042 ) {

                    item_desc += '-' + nlapiGetLineItemValue('item', 'description', i) + '\n';
                }

                if (item_name == 1042 && item_change_status != true) {
                    nlapiSetLineItemValue('item', 'description', item_desc, false, true);
                    item_desc = '';
                    disable_lineitem(type);
                }

                if (item_name == 1042 && item_change_status == true) {

                    if (item_count == (i - last_desc)) {
                        nlapiSetLineItemValue('item', 'description', i, item_desc);
                        item_desc = '';
                        disable_lineitem(type);
                    }

                }
                if (item_name == 1042 && item_change_status == true && item_count != i) {
                    item_desc = '';
                }

            }
			return true;
        }
	
    }
    
}
var last_desc = 0;

function VALIDATE_LINE_ESTIMATE_INSERT(type) {
    last_desc = 0;
	 var get_currentline = parseInt(nlapiGetCurrentLineItemIndex(type));
	 		if(get_currentline==1){
			if(nlapiGetCurrentLineItemValue('item', 'item')==1042){
			alert('Please Add Products to be Bundled');
			return false;
			}
		}
    if (type == 'item') {
        var item_change_status = nlapiIsLineItemChanged('item');
        var item_count = nlapiGetLineItemCount('item');
       
        var desc_current = nlapiGetCurrentLineItemValue('item', 'description');
        var item_desc = '';
        var item_name = nlapiGetCurrentLineItemValue('item', 'item');

        if (item_name != 1042) {

            for (var i = 1; i <= item_count; i++) {

                var item_name = nlapiGetLineItemValue('item', 'item', i);
                var current_lineitem = nlapiGetCurrentLineItemValue('item', 'item', i);

                if (nlapiGetLineItemValue('item', 'item', i) != 1042 ) {

                    item_desc += '-' + nlapiGetLineItemValue('item', 'description', i) + '\n';
                }

                if (nlapiGetLineItemValue('item', 'item', i) == 1042 && i > get_currentline) {	
                    if (item_change_status == true) {
                        nlapiSetLineItemValue('item', 'description', i, nlapiGetLineItemValue('item', 'description', i) + '\n -' + desc_current);
                        last_desc = 1
                    }
                    if (item_change_status == false) {

                        break;
                    }


                    break;
                }

            }
			
        }
		return true;
    }

    

}




function VALIDATE_LINE_ESTIMATE_DELETE(type, name) {
		 var get_currentline = parseInt(nlapiGetCurrentLineItemIndex(type));
	 		if(get_currentline==1){
			if(nlapiGetCurrentLineItemValue('item', 'item')==1042){
			alert('Please Add Products to be Bundled');
			return true;
			}
		}
    if (type == 'item') {
        var item_count = nlapiGetLineItemCount('item');
        var item_desc = '';
        for (var i = 1; i <= item_count; i++) {
            var item_name = nlapiGetLineItemValue('item', 'item', i);
            if (item_name != 1042 && get_currentline != i) {

                item_desc += '-' + nlapiGetLineItemValue('item', 'description', i) + '\n';
            }

            if (item_name == 1042) {
                if (i > get_currentline) {
                    nlapiSetLineItemValue('item', 'description', i, item_desc);
                    item_desc = '';
                    break;
                } else {
                    item_desc = '';
                }

            }
		
        }
		return true;
    }
    

}


function disable_lineitem(type) {

    var itemindex = nlapiGetCurrentLineItemIndex(type);
    var item_id = nlapiGetLineItemValue('item', 'item', itemindex);
    var item_count = nlapiGetLineItemCount('item');
    var decscArry = new Array();
    var bundArry = new Array();
    var incree = 0;
    var item_name = nlapiGetLineItemValue('item', 'item', itemindex - 1);

    for (var i = 1; i <= item_count; i++) {
        if (nlapiGetLineItemValue('item', 'itemtype', i) == 'NonInvtPart'||nlapiGetLineItemValue('item', 'itemtype', i) == 'Service'||nlapiGetLineItemValue('item', 'itemtype', i) == 'OthCharge'||nlapiGetLineItemValue('item', 'itemtype', i) == 'Group'||nlapiGetLineItemValue('item', 'itemtype', i) == 'Kit') {
            decscArry[incree] = i;
        } else if (nlapiGetLineItemValue('item', 'item', i) == 1042) {
            bundArry[incree] = i;
        }
        incree++;
    }

    if ((decscArry.length > 0) && (bundArry.length > 0)) {
        decscArry.reverse();
        var nonEmpty = decscArry.filter(function(e) {
            return String(e).trim();
        });

        var a = nonEmpty.indexOf(parseInt(itemindex));
        if (a == -1) {
            nlapiDisableLineItemField('item', 'description', false, itemindex);
        } else {
            nlapiDisableLineItemField('item', 'description', true, itemindex);
        }
    }


    return true;
}