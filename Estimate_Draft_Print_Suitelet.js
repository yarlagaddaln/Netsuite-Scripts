function suitelet_print(request, response){
		  var tranId = request.getParameter('custparam_recid');
		 // nlapiSubmitField('estimate', tranId, 'customform', 155);
var r =nlapiPrintRecord('TRANSACTION', tranId, 'PDF', {formnumber : 155});
response.setContentType('PDF', 'transaction'+tranId+'.pdf', 'inline');
    response.write(r.getValue());
}