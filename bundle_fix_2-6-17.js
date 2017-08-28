/******
 * @Author Lakshmi 01-20-17. Axioma Bundle description script at line item level
--Add bundle description on line item level that takes up all the line items added on an estimate record
-- excludes subtotal,total and note descriptions from the Bundle description
-- updates the bundle description upon any line item add or delete or remove operations

 ******/
var global_flag = 0;
var current_line = '';
var selected_line = '';
function VALIDATE_LINE_ESTIMATE_INIT(type) {
	var item_desc = '';
	if (type == 'item') {
		//alert('here1 enter'+current_line);
		var getitem_id = nlapiGetLineItemValue('item', 'item', current_line);
		selected_line = current_line;
		var item_change_status = nlapiIsLineItemChanged('item');
		var item_count = nlapiGetLineItemCount('item');
		var item_ids = [];
		var new_item = '';
		if (getitem_id == 1042 && item_change_status == true) {
			//alert('1st');
			for (i = current_line - 1; i >= 1; i--) {
				if (nlapiGetLineItemValue('item', 'item', i) == 1042) {
					break;
				}
				if((nlapiGetLineItemValue('item', 'item', i) != 72)&&(nlapiGetLineItemValue('item', 'item', i) != 69 && nlapiGetLineItemValue('item','item',i)!= -2)){
					item_ids.push('-' + nlapiGetLineItemText('item', 'item', i));
				}
				
			}
			item_ids.reverse();
			//alert(item_ids);
			for (j = 0; j < item_ids.length; j++) {
				item_desc += item_ids[j] + '\n';
			}
			nlapiSetLineItemValue('item', 'description', current_line, item_desc);
		} else {
			//alert('2nd');
			var bundle_ids = [];
			for (k = 1; k <= item_count; k++) {
				if (nlapiGetLineItemValue('item', 'item', k) == 1042) {
					bundle_ids.push(k);
				}
			}
			if ((bundle_ids.length > 0) && (current_line != '') && (current_line != 'undefined') && (item_change_status == true)) {
				var near_bundle = closestValue(bundle_ids, current_line);

				if (near_bundle > current_line) {
					
					var existing_bundle_text = nlapiGetLineItemValue('item', 'description', near_bundle) + '\n';
					if(nlapiGetLineItemValue('item','item',current_line)!= 72 && nlapiGetLineItemValue('item','item',current_line)!= 69 && nlapiGetLineItemValue('item','item',current_line)!= -2){
						//alert('bundle1'+near_bundle+'line1'+current_line+'change'+item_change_status);
					var new_item_text = '-' + nlapiGetLineItemText('item', 'item', current_line) + '\n';
					nlapiSetLineItemValue('item', 'description', near_bundle, existing_bundle_text + new_item_text);
					current_line =	'';				
					}
					
				} else {
					
					//alert('here2 enter'+current_line);
					var actual_bundle = nextclosestValue(bundle_ids, near_bundle);
					var existing_bundle_text = nlapiGetLineItemValue('item', 'description', actual_bundle) + '\n';
					if(nlapiGetLineItemValue('item','item',current_line)!= 72 && nlapiGetLineItemValue('item','item',current_line)!= 69 && nlapiGetLineItemValue('item','item',current_line)!= -2){
						//alert('bundle2'+near_bundle+'line2'+current_line);
						var new_item_text = '-' + nlapiGetLineItemText('item', 'item', current_line) + '\n';
					nlapiSetLineItemValue('item', 'description', actual_bundle, existing_bundle_text + new_item_text);
					current_line ='';
					}
					
				}

			}

		}
		disable_lineitem(type);
		return true;
		item_desc = '';
		current_line = '';
		
	}
}
var last_desc = 0;

function VALIDATE_LINE_ESTIMATE_INSERT(type) {
	last_desc = 0;
	var get_currentline = parseInt(nlapiGetCurrentLineItemIndex(type));
	if (get_currentline == 1) {
		if (nlapiGetCurrentLineItemValue('item', 'item') == 1042) {
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

		var get_discount_item_line = '';
		var get_bundle_item_line = '';
		get_discount_item_line = nlapiFindLineItemValue("item", "item", 69);

		if (item_name == 69 || item_name == 1042) {
			var check_line = get_currentline;
			if (item_name == 1042) {
				//fall back from current position to look a discount above
				for (a = check_line - 1; a >= 1; a--) {
					if (nlapiGetLineItemValue('item', 'item', a) == 69) {

						if (nlapiGetLineItemValue('item', 'item', a - 1) != 1042) {
							alert('Please Remove Discount above Bundle');
							global_flag = 1;
							return false;
							break;
						}
					}
					if ((nlapiGetLineItemValue('item', 'item', check_line - 1) == 1042 && nlapiGetLineItemValue('item', 'item', check_line) == 1042) || nlapiGetLineItemValue('item', 'item', check_line - 1) == -2 || nlapiGetLineItemValue('item', 'item', check_line - 1) == 69) {
						alert('Bundle not Allowed after a Bundle');
						global_flag = 1;
						return false;
						break;

					}
					if (nlapiGetLineItemValue('item', 'item', check_line + 1) == 1042) {
						alert('Bundle not Allowed before a Bundle');
						global_flag = 1;
						return false;
						break;

					}

				}
			}

			//trying to add discount above a bundle
			else if (item_name == 69) {
				for (b = check_line; b <= item_count; b++) {
					if (nlapiGetLineItemValue('item', 'item', check_line + 1) == 1042) {
						alert('Please add discount after Bundle');
						global_flag = 1;
						return false;
						break;
					}
				}
			}

		}

		if (item_name != 1042 || item_name != 69) {
			global_flag = 0;
		}
		return true;
	}
	disable_lineitem(type);
	return true;
}

function VALIDATE_LINE_ESTIMATE_DELETE(type, name) {

	var get_currentline = parseInt(nlapiGetCurrentLineItemIndex(type));
	if (get_currentline == 1) {
		if (nlapiGetCurrentLineItemValue('item', 'item') == 1042) {
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
				if ((nlapiGetLineItemValue('item', 'item', i) == 69) || (nlapiGetLineItemValue('item', 'item', i) == -2) || (nlapiGetLineItemValue('item', 'item', i) == 72)) {
					continue;
				}
				item_desc += '-' + nlapiGetLineItemText('item', 'item', i) + '\n';
			}

			if (item_name == 1042 && global_flag == 0) {
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
		if (nlapiGetLineItemValue('item', 'itemtype', i) == 'NonInvtPart' || nlapiGetLineItemValue('item', 'itemtype', i) == 'Service' || nlapiGetLineItemValue('item', 'itemtype', i) == 'OthCharge' || nlapiGetLineItemValue('item', 'itemtype', i) == 'Group' || nlapiGetLineItemValue('item', 'itemtype', i) == 'Kit') {
			decscArry[incree] = i;
		} else if (nlapiGetLineItemValue('item', 'item', i) == 1042) {
			bundArry[incree] = i;
		}
		incree++;
	}

	if ((decscArry.length > 0) && (bundArry.length > 0)) {
		decscArry.reverse();
		var nonEmpty = decscArry.filter(function (e) {
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

function getlinenum(type, name, linenum) {
	current_line = '';
	if (type == 'item') {
		current_line = linenum;
	}
	return true;
}

function getlinenum_fieldchanged(type, name, linenum) {
	current_line = '';
	if (type == 'item') {
		current_line = linenum;
	}
	return true;
}

function validate_insert(type) {
	current_line = '';
	if (type == 'item') {
		current_line = nlapiGetCurrentLineItemIndex(type);
	}
	return true;
}

function closestValue(array, value) {
	var result,
	lastDelta;
	array.some(function (item) {
		var delta = Math.abs(value - item);
		if (delta > lastDelta) {
			return true;
		}
		result = item;
		lastDelta = delta;
	});
	return result;
}

//this function runs if the new added item is nearer to the other bundle]
function nextclosestValue(array, wrong_bundle) {
	var orginal_bundle_ids = array;
	var current_bundle = orginal_bundle_ids.indexOf(wrong_bundle);
	var actual_bundle_id = orginal_bundle_ids[current_bundle + 1];
	return actual_bundle_id;
}