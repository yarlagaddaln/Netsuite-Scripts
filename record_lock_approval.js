var estimate_status = nlapiGetFieldValue('custbody30');
var stop_insert_flag = 0;
var field_name = '';
var line_numb = '';
var item_count_after = '';
function ValidateField(type, name) {
	if ((estimate_status == 8) || (estimate_status == 2)) {
		stop_insert_flag = 1;
		var fields_list = ['quantity', 'item', 'amount', 'rate', 'grossamt', 'custcol9', 'price'];
		var item_match = fields_list.indexOf(name);
		if (item_match != -1) {
			alert("You can only Change Item Description's after Approval.Please Process a change request if you want to add or delete items");
			return false;

		} else {
			return true;
		}

	}
	return true;
}

// validateLine
function validateLine(type) {

	if ((estimate_status == 8) || (estimate_status == 2)) {
		var itemindex = nlapiGetCurrentLineItemIndex(type);
		if (itemindex > item_count_after) {
			alert("You can only Change Item Description's after Approval.Please Process a change request if you want to add or delete items");
			return false;
		}
	}
	return true;
}

// validateInsert
function validateInsert(type) {
	if ((estimate_status == 8) || (estimate_status == 2)) {
		alert("You can only Change Item Description's after Approval.Please Process a change request if you want to add or delete items");
		return false;
	} else {
		return true;
	}
}

// validateDelete
function validateDelete(type) {
	if ((estimate_status == 8) || (estimate_status == 2)) {
		alert("You can only Change Item Description's after Approval.Please Process a change request if you want to add or delete items");
		return false;
	} else {
		return true;
	}
}

function myFieldChanged(type, name, linenum) {
	if ((estimate_status == 8) || (estimate_status == 2)) {
		field_name = name;
		line_numb = linenum;
	}
}

function disableLineItem() {
	if ((estimate_status == 8) || (estimate_status == 2)) {
		item_count_after = nlapiGetLineItemCount('item');
		nlapiDisableLineItemField('item', 'quantity', 'T');
		nlapiDisableLineItemField('item', 'item', 'T');
		nlapiDisableLineItemField('item', 'amount', 'T');
		nlapiDisableLineItemField('item', 'rate', 'T');
		nlapiDisableLineItemField('item', 'grossamt', 'T');
		nlapiDisableLineItemField('item', 'custcol9', 'T');
		nlapiDisableLineItemField('item', 'price', 'T');
	}
}