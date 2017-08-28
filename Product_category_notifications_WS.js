function productcategory_flag(type, form, request){
   var rec = nlapiGetNewRecord();
   var product_categories = rec.getFieldValue('custbody22');
if(product_categories.length > 1){
	return '1';
}
else{
	return '0';
}
nlapiLogExecution('DEBUG', 'Product Categories', 'values# = ' + product_categories);
}
