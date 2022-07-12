window.jentis = window.jentis || {};
window.jentis.consent = window.jentis.consent || {};

window.jentis.consent.consentBar = new function ()
{

	this.init = function ()
	{
		//Prüfen ob wir in einem IFrame sind. Falls ja - nichts ausspielen aber die Tools steuern.
		if(window.self !== window.top)
		{
			return true;
		}
		
		this.bEngineReady = false;
		this.bDocumentReady = false;
		this.bInitLateBarShow = false;
		
		this.sGenericPurposesText = "";
		
		//CSS Class Name Prefix
		this.styles = "jentis-consent-";
		this.init_eventlistener();

	}

	this.init_eventlistener = function ()
	{
		
		//Trigger von Außen um die Oberfläche anzuzeigen
		(function (oMe)
		{
			
			if(typeof window.jentis !== "undefined" && typeof window.jentis.consent !== "undefined" && typeof window.jentis.consent.engine !== "undefined")
			{
				//If the engine is allready loaded, we maybe missed the events, so we want to register at the engine instead of the document.
				var oConsentEngineEventBaseObject = window.jentis.consent.engine;			
			}
			else
			{
				//No engine allready exists, so it is safe to register at the document.
				var oConsentEngineEventBaseObject = document;
			}
			
			
			oConsentEngineEventBaseObject.addEventListener('jentis.consent.engine.init', function (e)
			{
				oMe.init_getData.call(oMe);
				
				oMe.templateConfig = window.jentis.consent.engine.getTemplateConfig();
				
				oMe.bEngineReady = true;
				oMe.startGui();

			}, false);

			if(	document.readyState !== "loading" )
			{
				//The document is allready loaded, so we can start immidiatly
				oMe.bDocumentReady = true;
				oMe.startGui();				
			}
			else
			{
				//The document is not allready loaded, so we have to listen to DOMContentLoaded
				document.addEventListener("DOMContentLoaded", function() {
					oMe.bDocumentReady = true;
					oMe.startGui();				
				});				
			}

				
			oConsentEngineEventBaseObject.addEventListener('jentis.consent.engine.show-bar', function (e)
			{
				
				if(document.getElementsByClassName(oMe.styles+"bar").length > 0)
				{
					oMe.showBottomBar();					
				}
				else
				{
					oMe.bInitLateBarShow = true;					
				}
				
			},false);

			oConsentEngineEventBaseObject.addEventListener('jentis.consent.engine.user-show-settings', function (e)
			{
				oMe.showModal();					
				
			},false);
			
			
			
		})(this);
	}

	this.init_getData = function()
	{
		
		
		var vendorData = window.jentis.consent.engine.getVendorFullData();				
		newVendorData = {};
		var aPurposes = {};
        for(var sVendorId in vendorData)
        {
            var oLoopVendorData = vendorData[sVendorId];

			if(typeof oLoopVendorData.category.id === "undefined")
			{
				oLoopVendorData.category.id = "-";
			}
			if(typeof oLoopVendorData.category.name === "undefined")
			{
				oLoopVendorData.category.name = "-";
			}
			

            var sJustificationId = oLoopVendorData.justification.id
            var sCategoryId = oLoopVendorData.category.id
			

            newVendorData[sJustificationId] = newVendorData[sJustificationId] || {};
			
			newVendorData[sJustificationId]["justificationname"] = oLoopVendorData.justification.name;
            newVendorData[sJustificationId]["justificationid"] = oLoopVendorData.justification.id;
			newVendorData[sJustificationId]["categories"] = newVendorData[sJustificationId]["categories"] || {};

            newVendorData[sJustificationId]["categories"][sCategoryId] = newVendorData[sJustificationId]["categories"][sCategoryId] || {};
            
			newVendorData[sJustificationId]["categories"][sCategoryId]["categoryname"] = oLoopVendorData.category.name
            newVendorData[sJustificationId]["categories"][sCategoryId]["categoryid"] = oLoopVendorData.category.id;

			newVendorData[sJustificationId]["categories"][sCategoryId]["vendors"] = newVendorData[sJustificationId]["categories"][sCategoryId]["vendors"] || {};            
            newVendorData[sJustificationId]["categories"][sCategoryId]["vendors"][sVendorId] = oLoopVendorData;			
			
			var sVendorPurposeText = "";
			if(typeof oLoopVendorData.purposes !== "undefined" && oLoopVendorData.purposes.length > 0)
			{
				for(var iPurposeLoop =0; iPurposeLoop < oLoopVendorData.purposes.length; iPurposeLoop ++)
				{
					var sPurposeId = oLoopVendorData.purposes[iPurposeLoop].id;
					var sPurposeName = oLoopVendorData.purposes[iPurposeLoop].name;
					
					if(aPurposes[sPurposeId] !== true)
					{
						this.sGenericPurposesText += sPurposeName+", ";
						aPurposes[sPurposeId] = true;
					}
					
					sVendorPurposeText += sPurposeName+", ";
				}
			}
			
			if(sVendorPurposeText.length > 0)
			{
				sVendorPurposeText.substr(0,sVendorPurposeText.length-2);
			}
			newVendorData[sJustificationId]["categories"][sCategoryId]["vendors"][sVendorId]["purposes"] = sVendorPurposeText;
			

        }
			
		if(this.sGenericPurposesText.length > 0)
		{
			this.sGenericPurposesText.substr(0,this.sGenericPurposesText.length-2);
		}	
		
		
		if(typeof window.jentis.consent.config === "undefined")
		{
			console.log("JENTIS Consent Bar: No JENTIS Consent Engine Config found");
			return true;			
		}
		
		
		this.vendorData = newVendorData;
		this.consentId = window.jentis.consent.engine.getConsentId();
		this.lastUpdate = window.jentis.consent.engine.getLastUpdateTime();
		
		
		
	}
	
	this.dom_eventlistener = function ()
	{
		//Trigger von Außen um die Oberfläche anzuzeigen
		(function (oMe)
		{
            document.getElementsByClassName(oMe.styles+"button-save")[0].addEventListener('click', function () {
                oMe.save.call(oMe);
            },false);

            document.getElementsByClassName(oMe.styles+"button-agree")[0].addEventListener('click', function () {
                oMe.allagree.call(oMe);
            },false);

            document.getElementsByClassName(oMe.styles+"button-agree")[1].addEventListener('click', function () {
                oMe.allagree.call(oMe);
            },false);

            document.getElementsByClassName(oMe.styles+"button-setting")[0].addEventListener('click', function () {
                oMe.showModal.call(oMe);
            },false);

            document.getElementsByClassName(oMe.styles+"button-deny")[0].addEventListener('click', function () {
                oMe.alldeny.call(oMe);
            },false);

            document.getElementsByClassName(oMe.styles+"button_close")[0].addEventListener('click', function () {
                oMe.closeModal.call(oMe);
            },false);

            document.getElementsByClassName(oMe.styles+"vendor-info-button-back")[0].addEventListener('click', function () {
                oMe.showCategoryList.call(oMe);
            },false);



            var aCategoryLabels = document.querySelectorAll(".jentis-consent-category_wrapper>li>label");
            for(var i=0; i < aCategoryLabels.length; i++ )
            {
                aCategoryLabels[i].addEventListener('click',function(){
                    oMe.openCategory.call(oMe,this);
                });
            }

            var aCategoryCheckboxes = document.querySelectorAll(".jentis-consent-category_wrapper>li>input");
            for(var i=0; i < aCategoryCheckboxes.length; i++ )
            {
                aCategoryCheckboxes[i].addEventListener('click',function(){
                    oMe.clickCategory.call(oMe,this);
                });
            }

            var aCategoryVendors = document.querySelectorAll(".jentis-consent-category_wrapper>li>ul>li>label");
            for(var i=0; i < aCategoryVendors.length; i++ )
            {
                aCategoryVendors[i].addEventListener('click',function(){
                    oMe.clickCategoryVendor.call(oMe,this);
                });
            }
			
		})(this);
	}

    this.openCategory = function(oLabel)
    {
        var oLi = oLabel.parentNode;
        var oUlChecboxWrapper = oLi.querySelectorAll("ul.jentis-consent-category-vendors-checkbox-wrapper")[0]
        if(oUlChecboxWrapper.style.display === "block")
        {
            oUlChecboxWrapper.style.display = "none";
        }
        else
        {
            oUlChecboxWrapper.style.display = "block";
        }
    }

    this.clickCategory = function(oCheckbox)
    {
        var oLi = oCheckbox.parentNode;
        var bCategoryChecked = oCheckbox.checked

        var aVendorCheckboxes = oLi.querySelectorAll("ul input");

        for(var i=0; i< aVendorCheckboxes.length; i++)
        {
            aVendorCheckboxes[i].checked = bCategoryChecked;
        }
    }

    this.clickCategoryVendor = function(oLabel)
    {
        var oLi = oLabel.parentNode;
        var sVendorId = oLi.getAttribute("data-vendorid");

        document.getElementsByClassName("jentis-consent-category_wrapper")[0].style.display = "none";
        document.getElementById("jentis-consent-vendor-info-"+sVendorId).style.display = "block";
        document.getElementsByClassName("jentis-consent-vendor_info")[0].style.display = "block";

    }

    this.showCategoryList = function(oButton)
    {
        //Hide all Vendor Infos Li again.
        var aVendorInfosLis = document.querySelectorAll(".jentis-consent-vendor_info-content");
        for(var i=0; i < aVendorInfosLis.length; i++ )
        {
            aVendorInfosLis[i].style.display = "none";
        }

        document.getElementsByClassName("jentis-consent-vendor_info")[0].style.display = "none";
        document.getElementsByClassName("jentis-consent-category_wrapper")[0].style.display = "block";


    }	
		
	this.showModal = function ()
	{		
		document.getElementsByClassName(this.styles+"modal")[0].style.display = 'block';
		//scroll to top:
		window.scrollTo(0, 0);
	}

	this.closeModal = function ()
	{
		document.getElementsByClassName(this.styles+"modal")[0].style.display = 'none';
	}

	this.closeBottomBar = function ()
	{
		document.getElementsByClassName(this.styles+"bar")[0].style.display = 'none';
	}

	this.showBottomBar = function ()
	{
		document.getElementsByClassName(this.styles+"bar")[0].style.display = 'flex';
	}

	this.alldeny = function ()
	{
		window.jentis.consent.engine.DenyAll();
		this.refreshGui();
		this.closeBottomBar();
		this.closeModal();
	}

	this.refreshGui = function()
	{
		this.init_getData();
		this.getHtml();
		this.dom_eventlistener();
	}

	this.allagree = function ()
	{
		window.jentis.consent.engine.AcceptAll();
		this.refreshGui();
		this.closeBottomBar();
		this.closeModal();
	}

	this.save = function ()
	{
		var aVendorCheckboxes = document.querySelectorAll(".jentis-consent-category-vendors-checkbox-wrapper .jentis-consent-checkbox");
		var aVendors = {};
		for(var i=0; i< aVendorCheckboxes.length; i++)
		{
			var sId = aVendorCheckboxes[i].value;
			aVendors[sId] = aVendorCheckboxes[i].checked;			
		}
				
		window.jentis.consent.engine.setNewVendorConsents(aVendors);
		this.closeBottomBar();
		this.closeModal();
	}


	//*****************************
	//*****************************	
	//DOM FUNCTIONS
	//*****************************
	//*****************************
	
	
	this.startGui = function()
	{
		
		if(this.bEngineReady === true && this.bDocumentReady === true)
		{
			this.getHtml();
			this.dom_eventlistener();
			
			if(this.bInitLateBarShow === true)
			{
				this.showBottomBar();
			}
		}
	}

	this.createDom = function (sClassName,oParentDom,sElement,sId)
	{
		if(typeof sElement === "undefined")
		{
			sElement = "div";
		}		
		oDomElement = document.createElement(sElement);
		
		if(typeof sId !== "undefined")
		{
			oDomElement.setAttribute("id",this.styles+sId);
		}
		
		if(typeof sClassName !== "undefined")
		{			
			this.setDomClass(oDomElement,sClassName);
		}
		
		if(typeof oParentDom !== "undefined")
		{
			oParentDom.appendChild(oDomElement);
		}
		
		return oDomElement;
	}

	this.setDomClass = function (oDomElement,sClassName)
	{
		oDomElement.setAttribute("class",this.styles+sClassName);
	}
	
	this.createCheckbox = function(oParent,sId,bSelected,sLabel)
	{
		
		var oDomCheckboxLi = this.createDom("checkbox-wrapper",oParent,"li","checkbox-wrapper-"+sId);
		oDomCheckboxLi.setAttribute("data-vendorid",sId);
		
		var oDomCheckbox = this.createDom("checkbox",oDomCheckboxLi,"input","checkbox-"+sId);
		oDomCheckbox.setAttribute("name",this.styles+"checkbox-"+sId);
		oDomCheckbox.setAttribute("value",sId);
		oDomCheckbox.setAttribute("type","checkbox");
		if(bSelected === true)
		{
			oDomCheckbox.setAttribute("checked","checked");
		}
		
		var oDomLabel = this.createDom("label",oDomCheckboxLi,"label","label-"+sId);
		//oDomLabel.setAttribute("for",this.styles+"checkbox-"+sId);
		oDomLabel.innerHTML = sLabel;	

		return oDomCheckboxLi;
	}	
	
	
	//*****************************
	//*****************************	
	//HTML OUTPUT
	//*****************************
	//*****************************
	
	this.getHtml = function ()
	{

		var oDomModal = this.getHtmlModal();
		var oDomConsentBar = this.getHtmlConsentbar();


		//Outer Div noch nicht vorhanden, daher jetzt erstellen und einhängen.
		oOuterDiv = this.createDom("main",document.getElementsByTagName("body")[0],"div","main");		
		oOuterDiv.appendChild(oDomModal)
		oOuterDiv.appendChild(oDomConsentBar);

		return true;
	}

    this.getHtmlCategoryBox = function (oCategoryData)
    {

        var oDomCategoryCheckbox = this.createCheckbox(undefined,oCategoryData.categoryid,false,oCategoryData.categoryname)
        var oDomCategoryVendors = this.createDom("category-vendors-checkbox-wrapper",oDomCategoryCheckbox,"ul");

        var bCheckCategory = true;
        for(var sVendorId in oCategoryData.vendors)
        {
            var oDomVendorCheckbox = this.createCheckbox(oDomCategoryVendors,sVendorId,oCategoryData.vendors[sVendorId].status,oCategoryData.vendors[sVendorId].vendor.name);
            if(oCategoryData.vendors[sVendorId].status === false)
            {
                bCheckCategory = false;
            }
        }

        if(bCheckCategory === true)
        {
            oDomCategoryCheckbox.getElementsByTagName("input")[0].checked = true;
        }

        return oDomCategoryCheckbox

    }
	
    this.getHtmlModal = function ()
    {

        //First delete an old modal
        var oOldModal = document.getElementsByClassName(this.styles+"modal");
        if(oOldModal.length > 0)
        {
            oOldModal[0].parentNode.removeChild(oOldModal[0]);
        }

        var oDomDivModal = this.createDom("modal");

        //Set the Close Button.
        var oDomDivCloseButtonWrapper = this.createDom("button_close_wrapper",oDomDivModal)
        var oDomDivCloseButton = this.createDom("button_close",oDomDivCloseButtonWrapper)
        oDomDivCloseButton.innerHTML = "x";


        //Set the Purpose Checkboxes and the vendor Info Boxes
        var oDomDivCategories = this.createDom("category_wrapper",oDomDivModal,"ul");
        var oDomDivVendorInfos = this.createDom("vendor_info",oDomDivModal,"div");

        var oDomDivVendorInfoContent = this.createDom("vendor-info-button-back",oDomDivVendorInfos,"div");
        oDomDivVendorInfoContent.innerHTML = "back to list";


        var oDomDivVendorInfosUl = this.createDom("vendor_info_ul",oDomDivVendorInfos,"ul");

		

        for (var sCategoryId in this.vendorData["consent"]["categories"])
        {
            var oDomCategoryBox = this.getHtmlCategoryBox(this.vendorData["consent"]["categories"][sCategoryId]);
            oDomDivCategories.appendChild(oDomCategoryBox);

            var aVendors = this.vendorData["consent"]["categories"][sCategoryId]["vendors"];

            for(sVendorId in aVendors)
            {

                var oVendor = aVendors[sVendorId];

                var oDomDivVendorInfoLi = this.createDom("vendor_info-content",oDomDivVendorInfosUl,"li","vendor-info-"+sVendorId);

                var oDomDivVendorInfoContentLEFT = this.createDom("vendor-info-left",oDomDivVendorInfoLi,"div");


                var oDomDivVendorInfoContent = this.createDom("vendor-info-name",oDomDivVendorInfoContentLEFT,"div");
                oDomDivVendorInfoContent.innerHTML = oVendor["vendor"]["name"];

                var oDomDivVendorInfoContent = this.createDom("vendor-info-street",oDomDivVendorInfoContentLEFT,"div");
                oDomDivVendorInfoContent.innerHTML = oVendor["vendor"]["street"];

                var oDomDivVendorInfoContent = this.createDom("vendor-info-zip",oDomDivVendorInfoContentLEFT,"div");
                oDomDivVendorInfoContent.innerHTML = oVendor["vendor"]["zip"];

                var oDomDivVendorInfoContent = this.createDom("vendor-info-country",oDomDivVendorInfoContentLEFT,"div");
                oDomDivVendorInfoContent.innerHTML = oVendor["vendor"]["country"]["name"];

                var oDomDivVendorInfoContent = this.createDom("vendor-info-purpose",oDomDivVendorInfoContentLEFT,"div");
                oDomDivVendorInfoContent.innerHTML = "Purpose: "+oVendor["purposes"];				

                var oDomDivVendorInfoContent = this.createDom("vendor-info-justification",oDomDivVendorInfoContentLEFT,"div");
                oDomDivVendorInfoContent.innerHTML = "Justification: "+oVendor["justification"]["name"];

                var oDomDivVendorInfoContentRIGHT = this.createDom("vendor-info-right",oDomDivVendorInfoLi,"div");

                var oDomDivVendorInfoContent = this.createDom("vendor-info-description",oDomDivVendorInfoContentRIGHT,"div");
                oDomDivVendorInfoContent.innerHTML = oVendor["description"];


            }
        }




        //Set the Contact Info Box.
        var oDomDivContact = this.createDom("contact_wrapper",oDomDivModal)
        oDomDivContact.innerHTML = this.templateConfig.contact;

        //Set the Button Box.
        var oDomDivButtons = this.createDom("button_wrapper",oDomDivModal)

        var oDomButtonSave = this.createDom("button-save button-prim",oDomDivButtons);
        oDomButtonSave.innerHTML = this.templateConfig.buttonSave;

        var oDomButtonAgree = this.createDom("button-agree button-sec",oDomDivButtons);
        oDomButtonAgree.innerHTML = this.templateConfig.buttonAgree;

        return oDomDivModal;
    }



    this.getHtmlConsentbar = function ()
    {

        var oDomDivBar = this.createDom("bar");

        var oDomDivTextWrapper = this.createDom("consent-text",oDomDivBar)


        //Set the Text Box.
        var oDomDivText = this.createDom("consent-text-inner",oDomDivTextWrapper)
        var sConsentText = this.templateConfig.consentText;
        var sPurposes = this.sGenericPurposesText;

        sConsentText = sConsentText.replace("{{purposes}}",sPurposes);
        oDomDivText.innerHTML = sConsentText;


        //Set the Link Box.
        if(typeof this.templateConfig.importantLinks !== "undefined")
        {
            var oDomDivLinks = this.createDom("consent-links",oDomDivTextWrapper);
            for(var sLinkName in this.templateConfig.importantLinks)
            {
                var oDomALink = this.createDom(undefined,oDomDivLinks,"a");
                oDomALink.setAttribute("href",this.templateConfig.importantLinks[sLinkName]);
                oDomALink.innerHTML = sLinkName;
            }
        }


        //Set the Button Box.
        var oDomDivButtons = this.createDom("button_wrapper",oDomDivBar)

        var oDomButtonAgree = this.createDom("button-agree button-prim",oDomDivButtons);
        oDomButtonAgree.innerHTML = this.templateConfig.buttonAgree;

        var oDomButtonSettings = this.createDom("button-setting button-sec",oDomDivButtons);
        oDomButtonSettings.innerHTML = this.templateConfig.buttonSetting;

        var oDomButtonDeny = this.createDom("button-deny button-sec",oDomDivButtons);
        oDomButtonDeny.innerHTML = this.templateConfig.buttonDeny;

        return oDomDivBar;

    }

	this.init();
}
