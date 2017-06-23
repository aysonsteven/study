
    var svgNamespace = "http://www.w3.org/2000/svg",
    	xmlNamespace = "http://www.w3.org/2000/xmlns/",
    	markupTypes = {
			Circle : 0,
			Rectangle : 1,
			Line : 2,
			Arrow: 3,
			Text: 4,
			RectangleRedaction : 5,
			SearchHighlight : 6,
			TextHighLight : 7,
			TextRedactHighlight : 8,
			StrikeThrough : 9,
			CollabHighlight : 10,
			StickyNote : 11,
			Stamp: 12,
			Image: 13
		},
		markupSaveType = {
    		Circle : 'circle',
    		CircleFilled : 'circle_filled',
    		Rectangle : 'rectangle',
    		RectangleFilled : 'rectangle_filled',
    		Line : 'line',
    		Arrow : 'arrow',
    		Text : 'text',
    		RectangleRedaction : 'rectangle_filled_redact'
    	}, //PCC Equivalent of annotations drawn. Only for reference if ever PCC markup will be supported
		pagePrefix = 'udv',
		pagePrefixId = 'udv_page_',
		handleCollection = [],
		pageCollection = [], //Collection of UDVPage elements representing each page
		annotationsNav = [],
    	redactionsNav = [],
		tempHighlightCollection = {};
		markUpCollection = {},
		editButtonHeight = '26',
		editButtonWidth = '26',
		isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0, // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
		isFirefox = typeof InstallTrigger !== 'undefined', // Firefox 1.0+
		isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0, // At least Safari 3+: "[object HTMLElementConstructor]"
		isChrome = !!window.chrome && !isOpera, // Chrome 1+
		isIE = false || !!document.documentMode, // /*@cc_on!@*/ At least IE6
		isEdge = /Edge/.test(navigator.userAgent),
		layerOptions = {
    		Top : 'Top',
    		Bottom : 'Bottom',
    		Forward : 'Forward',
    		Backward : 'Backward'
    	},
    	visibilityMode = {
			Shown : 1,
			Hidden : 0,
			Transparent : 0.2
		},
		//Default attributes of UDV MarkupObjects
		defaultFillColorShapes = 'rgb(0, 0, 255)',
		defaultHighlightColor = 'rgb(0,178,255)',
		defaultHighlightTextColor = 'rgb(255,255,0)',
		defaultCollabHighlightColor = 'rgb(255, 165, 0)',
		defaultActiveHighlightColor = 'rgb(203,203,1)',
		defaultFillColorText = 'rgb(255, 255, 255)',
		defaultResizeTextRedactionHighlightColor = 'rgb(0, 102, 255)',
		defaultRedactionFillColor = 'rgb(0, 0, 0)',
		defaultRedactionFontColor = 'rgb(255, 255, 255)',
		defaultFillColorBorder = 'rgb(0, 0, 0)',
		defaultFontColor = 'rgb(0, 0, 0)',
		defaultLineColor = 'rgb(0, 0, 0)',
		defaultFillWidthShapes = '2',
		defaultFillWidthLine = '2',
		defaultOpacity = '100%',
		defaultHighlightOpacity = '50%',
		defaultTextHighlightOpacity = '30%',
		defaultCopyTextHighlightColor = 'rgb(51,51,204)',
		defaultBoundingLineBorderWidth = '20',
		defaultCollabTransparency = '0';
		erroredPage = {
			height : 1056,
			width : 816
		},
		redactionFontSize = 12;