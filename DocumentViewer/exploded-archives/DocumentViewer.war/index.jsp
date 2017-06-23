<%@ page language="java" contentType="text/html;"%>
<%@page import="com.icomteq.udv.config.*"%>
<%@page import="java.io.BufferedReader"%>
<%@page import="java.io.File"%>
<%@page import="java.io.FileReader"%>
<%@page import="java.io.IOException"%>
<html>
<head>
	<title>Document Viewer</title>     
	
	
	<link rel="stylesheet" href="css/font-awesome/font-awesome.min.css">
	<!-- FONT AWESOME -->
	
	<link rel="stylesheet" type="text/css" href="css/style.css">
	<link rel="stylesheet" type="text/css" href="css/demo-style.css">
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	
	<script src="js/api/jquery.js"></script>
	<script type="text/javascript" src="js/api/bootstrap-modal.min.js"></script>
	
	<style>
	
	.restrict{
		cursor : not-allowed;
		opacity : 0.5;
	}
	
	.notesIcon{
		padding: 5px 6px;
		display: inline-block;
		vertical-align: top;
		font-size: 20px;
		color: #fff;
	}
	
	.stampIcon{
		padding: 5px 6px;
		display: inline-block;
		vertical-align: top;
		font-size: 20px;
		color: #fff;
	}
	.positionContainer {
		min-height: 25px;
		max-height: 200px;
		width: 200px;
		background-color: #fff;
		position: relative;
		
		overflow: auto;
	}
	
	.stampControlsContainer {
		float: left;
		margin-left: 3px;
		margin-top: 7px;
		position: relative;
	}
	
	.tagset-container {
		background-color: #fff;
		width: 180px;
		margin-bottom: 10px;
		padding-right: 20px;
	}
	
	.tag-container {
		background-color: #fff;
		width: 180px;
		margin-bottom: 10px;
		padding-right: 20px;
	}
	
	.selected-tagSet {
		height: 19px;
		padding: 2px 4px;
		line-height: 19px;
	}
	
	.selected-tagSet > span {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		width: 180px;
		display: inline-block;
	}
		
	.tagSet-available-container {
		min-height: 25px;
		max-height: 200px;
		width: 200px;
		background-color: #fff;
		position: absolute;
		display: none;
		overflow: auto;
	}
	
	.tagSets-holder{
		white-space: normal;
		border-bottom: 1px dotted silver;
		white-space: normal;
		line-height: 16px;
		padding: 4px;
		background-color:#fff;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
	
	</style>
</head>

<body id="mainbody" style="min-width: 250px;">
	<div id="blocker"> 
	</div>
	<div id="viewer-wrapper"> 
		<p id="mobile-warning" class="mobileWarningFormat">
			Warning: Review tools are disabled on mobile
		</p>
		<div id="viewer-menu" class="notSelected">
			<ul class="tab-menu">
				<li class="tab-active noselect" id="pageTab" data-name="page"><span>Page</span><i class="fa fa-files-o" title="Page"></i></li>
				<li class="review-tab noselect annotate-tab" id="annotateTab" data-name="annotate"><span>Annotate</span><i class="udv-font udv-annotation-btn" title="Annotate"></i></li>
				<li class="review-tab noselect redact-tab" id="redactTab" data-name="redact"><span>Redact</span><i class="udv-font udv-redact-btn" title="Redact"></i></li>
				<li class="review-tab noselect" id="searchTab" data-name="search"><span>Search</span><i class="fa fa-search" title="Search"></i></li>
				
				<!-- disabled Collaborate manually for JurisLib Integration, Collaborate Tab not yet configurable 
				<li class="review-tab noselect tab-active" id="collabTab" data-name="collab" style="display: block;"><span>Collaborate</span><i class="fa fa-users" title="Collaborate"></i></li>
				-->
				
				<!--<a class="expand-links" title="Show Tabs"><i class="fa fa-sliders"></i></a> -->
			</ul> 
			
			<div class="page-nav-container">
				<ul>
					<li id="firstPage" class="cursorHand">
						<!-- <img src="images/first.png" title="First Page"> -->
						<i id="firstBtn" class="fa fa-step-backward" title="First Page"></i>
					</li>
					<li id="prevPage" class="cursorHand">
						<!-- <img src="images/prev.png" title="Previous Page"> -->
						<i id="prevBtn" class="fa fa-caret-left" title="Previous Page"></i>
					</li>
					<li>
						<div class="page-count">
							<input type="text" class="current-page" value="0"> <span>of</span> <span class="pages">0</span>
						</div>
					</li>
					<li id="nextPage" class="cursorHand">
						<!-- <img src="images/next.png" title="Next Page"> -->
						<i id="nextBtn"  class="fa fa-caret-right" title="Next Page"></i>
					</li>
					<li id="lastPage" class="cursorHand">
						<!-- <img src="images/last.png" title="Last Page"> -->
						<i id="lastBtn" class="fa fa-step-forward" title="Last Page"></i>
					</li>
				</ul>
			</div>
			
			
			<!-- START OF RIGHT SIDE -->		

			<div class="right-side">
				<button class="btn bars" title="Menu"><i class="fa fa-bars"></i></button>
				<div class="rs-btn">
					<div class="otherMenus">

						<div class="cursorHand downloadDocument disable-tool" id="showDownloadModal"> 
							<!-- <img src="images/download.png" title="Download Document"> -->
							<i class="fa fa-download" title="Download Document"></i> 
						</div>
						<!--  <div class="cursorHand">-->
						<!-- <i class="fa fa-download" title="Download Document" data-toggle="modal" data-target="#downloadModal"></i>-->
						<!-- </div>-->
						<div class="cursorHand printDocument disable-tool">
							<!-- <img src="images/printer.png" title="Print Document"> -->
							<i class="fa fa-print" title="Print Document"></i>
						</div>
						<div class="cursorHand saveDocSettings disable-tool">
							<!-- <img src="images/under-redact/save.png" title="Save Document Settings"> -->
							<i class="fa fa-floppy-o" title="Save Document Settings"></i>
						</div>
					</div>

					<div id="visibility-menu-container">
						<div class="visibilityDefinedContainerRedaction cursorHand" id="redactVisibility">
							<div class="selected-visibility-redaction">
								<img src="images/r-show.png" class="visibility-holder-redaction disable-tool" data-visibility="Show Redaction" title="Change Redaction Visibility to Semi-Transparent"/>
							</div>
							<div class="visibility-available-container">
								<img src="images/r-show.png" class="visibility-holder-redaction" data-visibility="Show Redaction"/>
								<img src="images/r-trans.png" class="visibility-holder-redaction" data-visibility="Semi-Transparent Redaction"/>
								<img src="images/r-hide.png" class="visibility-holder-redaction" data-visibility="Hide Redaction"/>
							</div>
						</div>

						<div class="visibilityDefinedContainerAnnotation cursorHand" id="annotateVisibility">
							<div class="selected-visibility-annotation">
								<img src="images/a-show.png" class="visibility-holder-annotation disable-tool" data-visibility="Show Annotation" title="Change Annotation Visibility to Semi-Transparent"/>
							</div>
							<div class="visibility-available-container">
								<img src="images/a-show.png" class="visibility-holder-annotation" data-visibility="Show Annotation"/> 
								<img src="images/a-trans.png" class="visibility-holder-annotation" data-visibility="Semi-Transparent Annotation"/> 
								<img src="images/a-hide.png" class="visibility-holder-annotation" data-visibility="Hide Annotation"/> 
								<!-- <i class="udv-font udv-annotation-show-visibility visibility-holder-annotation" data-visibility="Show Annotation"></i> -->
								<!-- <i class="udv-font udv-annotation-transparent-visibility visibility-holder-annotation" data-visibility="Semi-Transparent Annotation"></i> -->
								<!-- <i class="udv-font udv-annotation-hidden-visibility visibility-holder-annotation" data-visibility="Hide Annotation"></i> -->
							</div>
						</div>
					</div>
				</div>

			</div>

			<!-- END OF RIGHT SIDE -->
			
			<div id="viewer-menu-content" class="notSelected">
				<!-- Under Page Menu -->
				<div class="under-page">
					<div class="page-tool-container">
						<div id="page-handtool"  class="cursorHand" data-drag="unable" data-lastState=false>
							<i id="panTool" class="fa fa-hand-paper-o" title="Pan Tool"></i>
						</div>
						<div id="page-rotatePage" class="cursorHand">
							<i id="rotateClockwise" class="fa fa-repeat" title="Rotate Page Clockwise"></i>
						</div>
						<div id="page-rotatePageCounter" class="cursorHand">
							<i id="rotateCounterClockwise" class="fa fa-undo" title="Rotate Page Counter Clockwise"></i>
						</div>
						<div id="page-rotateDoc" class="cursorHand">
							<i id="rotateDocumentClockwise" class="fa fa-repeat" title="Rotate Document Clockwise" style="background-color: #fff; color: #575757;"></i>
						</div>
						<div id="page-rotateDocCounter" class="cursorHand">
							<i id="rotateDocumentCounterClockwise" class="fa fa-undo" title="Rotate Document Counter Clockwise" style="background-color: #fff; color: #575757;"></i>
						</div>
					</div>
					
				</div>
				<!-- End of Under Page Menu -->
				
				<!-- Under Search Menu -->
				<div class="under-search">
					<div id="searchContainer" style="padding: 1px 0 0 7px; position: relative;">
						<div class="group-container">
							<div class="input-group">
								<div class="input-group-btn">
									<button type="button" id="searchOptionId" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" title="Search options" style="text-indent: -9999; position: relative; height: 22px;outline:none;">Search options 
										<span class="caret search-caret-moz" style="position: absolute; top: 8px; left: 6px;"></span>
									</button>
									<ul class="dropdown-menu">
										<li id="exactWord"><i class="fa fa-check selected-search-option"></i><span class="search-option">Exact Word or Phrase</span></li>
										<li id="caseSensitive"><i class="fa fa-check selected-search-option"></i><span class="search-option">Case Sensitive</span></li>
									</ul>
								</div><!-- /btn-group -->
								<input id="searchBox" type="text" class="form-control search-box-moz" aria-label="Search Document" placeholder="Search" style="height: 22px;outline:none;padding: 0px 43px 0px 3px !important;border-top-right-radius: 4px; border-bottom-right-radius: 4px;">
								<i id="searchBtn" class="fa fa-search magnifying-glass" title="Search"></i>
								<span  id="clearSearchBox" class="clear-search" title="Clear">
									<i class="fa fa-times" style="padding: 2px 0 0 4px; color: #575757;"></i>
								</span>
							</div><!-- /input-group -->
						</div><!-- /group-container -->
						<span class="search-results" title="Hit Result">
							<span style="position:relative;top:1px;">
								<span style=" padding: 0 5px; color: #fff;" id="walker">0</span>of<label style=" padding: 0 5px; color: #fff; " id="resultHit">0</label>
							</span>
						</span>
						<div class="next-prev-btn"><i id="prevHit" class="udv-font udv-previous-btn" title="Previous"></i><i id="nextHit" class="udv-font udv-next-btn" title="Next"></i></div>
					</div>
				</div>
				<!-- End of Under Search Menu -->

				<!-- Under Annotation -->
				<div class="under-annotate">
					<div class="redact-container">
						<!-- <img src="images/under-redact/arrow.png" id="addArrow" class="annotateIcons cursorHand" title="Arrow Annotation" data-active="false"  data-annotate="3"> -->
						
						<i id="addArrow" class="udv-font udv-arrow-annotation annotateIcons cursorHand annotationBtnWithProperties mute" title="Arrow Annotation" data-active="false"  data-annotate="3"></i>
						<!-- <img src="images/under-redact/line.png" id="addLine" class="annotateIcons cursorHand" title="Line Annotation" data-active="false"  data-annotate="2"> -->

						<i id="addLine" class="udv-font udv-line-annotation annotateIcons cursorHand annotationBtnWithProperties mute" title="Line Annotation" data-active="false"  data-annotate="2"></i>
						<!-- <img src="images/under-redact/square.png" id="addSquare" class="annotateIcons cursorHand" title="Rectangle Annotation" data-active="false"  data-annotate="1"> -->
						
						<i id="addSquare" class="udv-font udv-square-annotation annotateIcons cursorHand annotationBtnWithProperties mute" title="Rectangle Annotation" data-active="false"  data-annotate="1"></i>
						<!-- <img src="images/under-redact/circle.png" id="addCircle" class="annotateIcons cursorHand" title="Circle Annotation" data-active="false"  data-annotate="0"> -->
						<i id="addCircle" class="udv-font udv-circle-annotation annotateIcons cursorHand annotationBtnWithProperties mute" title="Circle Annotation" data-active="false"  data-annotate="0"></i>
						<!-- <img src="images/under-redact/text.png" id="addText" class="annotateIcons cursorHand" title="Text Annotation" data-active="false"  data-annotate="4"> -->
						<i id="addText" class="udv-font udv-text-annotation annotateIcons cursorHand annotationBtnWithProperties mute" title="Text Annotation" data-active="false"  data-annotate="4"></i>
						
						<i id="highLightBtn" class="udv-font udv-text-highlight annotateIcons cursorHand annotationBtnWithProperties mute" title="Text Highlight Annotation" data-active="false" data-annotate="7"></i>
						<!-- disable stickynote,stamp, image 
						<i id="stickyNoteBtn" class="fa fa-sticky-note-o annotateIcons cursorHand annotationBtnWithProperties mute" title="Note Annotation" data-active="false" data-annotate="11" aria-hidden="true"></i>
						<i id="stampBtn" class="fa fa-tags annotateIcons cursorHand annotationBtnWithProperties mute" title="Stamp Annotation" data-active="false" data-annotate="12" aria-hidden="true"></i>
						<i id="imageBtn" class="fa fa-picture-o annotateIcons cursorHand annotationBtnWithProperties mute" title="Image Annotation" data-active="false" data-annotate="13" aria-hidden="true"></i>
						-->
					</div>
				</div>
				<!-- End of Under Annotate -->

				<!-- Under Redact Menu -->
				<div class="under-redact">
					<div class="redact-container">
						<img src="images/under-redact/redact.png" id="addRedact" class="annotateIcons cursorHand redactionBtnWithProperties mute" title="Filled Redact" data-active="false"  data-annotate="5">
					</div>
					<div class="full-page-redaction-btn" id="showRedactModal">
						<i class="udv-font udv-redact-btn" title="Full Page Redaction" data-toggle="modal" data-target="#redactionModal"></i> 
					</div>
					<div class="highlight-redact-container">
						<i id="highLightRedactBtn" class="udv-font udv-text-highlight redactionBtnWithProperties cursorHand mute" title="Text Highlight Redaction" data-active="false"  data-annotate="8" style="padding: 1px 3px 1px 3px;"></i>
					</div>
					<!-- REDACTION PATTERN MODAL -->
					
					<div class="redact-pattern-container">
						
						<button id="redactPatternBtn" data-toggle="modal" data-target=".redact-pattern-modal" title="Redaction Pattern"><i class="fa fa-cogs"></i></button>
						
					</div>
					
					<!-- REDACTION PATTERN MODAL -->
				</div>
				<!-- End of Under Redact Menu -->

				<!-- COLLABORATION CONTAINER -->

			<div class="collab-container">
				<ul>
					<li>
						<button id="collabStrikeOutBtn" class="collabBtnWithProperties mute" data-active="false" data-annotate="9" title="Strikeout">
							<i id="strikeOutTab" class="fa fa-strikethrough"></i>
						</button>
					</li>
					<li>
						<button id="collabHighlightBtn" class="collabBtnWithProperties mute" data-active="false" data-annotate="10" title="Highlight">
							<i id="collabHighlightTab" class="udv-font udv-text-highlight"></i>
						</button>
					</li>
					<!-- <li>
						<button id="collabCommentBtn">
							<i class="fa fa-comment"></i>
						</button>
					</li> -->
				</ul>
			</div>
			
			<!-- Page Zoom -->
			<div id="page-zoomtool">
				<div class="zoomControls">
					<i id="textSelection" class="udv-font udv-text-selection" title="Text Selection"></i>
					<i id="zoomOut" class="fa fa-minus cursorHand zoomOut" title="Zoom Out"></i>
					<i id="zoomIn" class="fa fa-plus cursorHand zoomIn" title="Zoom In"></i> 
					<i id="fitToWidth" class="udv-font udv-fit-to-width cursorHand" title="Fit to width" style="position: absolute;right: -97px;top: 7px; padding: 3px 4px;"></i>
					<i id="magnifyingGlass" class="u-magnifying cursorHand" title="Magnifying Glass"></i>
					<i id="magnifyingGlassCaret" class="fa fa-sort-desc"></i>
				</div>
				<div class="zoomDefinedContainer">
					<div class="selected-zoom">
						<span title="Zoom Percentage">100%</span>	
					</div>
						<!--<div class="zoom-available-container">
							<div class="zoom-holder">Automatic Zoom</div>
							<div class="zoom-holder">Page Fit</div>
							<div class="zoom-holder">Page Width</div>
							<div class="zoom-holder">25%</div>
							<div class="zoom-holder">50%</div>
							<div class="zoom-holder">75%</div>
							<div class="zoom-holder">100%</div>
							<div class="zoom-holder">125%</div>
							<div class="zoom-holder">150%</div>
							<div class="zoom-holder">175%</div>
							<div class="zoom-holder">200%</div>
							<div class="zoom-holder">300%</div>
							<div class="zoom-holder">400%</div>
							<div class="zoom-holder">500%</div>
						</div> -->
					</div>
					<!-- MAGNIFYING RANGE SLIDER -->
					<div class="range-slider hide">
					  <input class="range-slider__range" type="range" value="2" min="1" max="10" />
					  <span class="range-slider__value">0</span>
					</div>
					<!-- END MAGNIFYING RANGE SLIDER -->
				</div>
				
				<!-- END OF PAGE ZOOM  -->
				
			</div>
		</div>
		
		<div id="wrapper">
			<div id="viewer-searchbox">
				<div class="containerControls">
					<img src="images/close.png" class="cursorHand" id="closeSearchMenu" title="Close">
				</div>

				<div class="searchControls">
					<img src="images/under-search/searchBox/match-exact.png" title="Match Exact" class="cursorHand" id="matchExact" data-active="false">
					<img src="images/under-search/searchBox/match-case.png" title="Match Case" class="cursorHand" id="matchCase" data-active="false">
					<img src="images/under-search/searchBox/whole-word.png" title="Whole Word" class="cursorHand" id="wholeWord" data-active="false">
					<img src="images/under-search/searchBox/begins-with.png" title="Begins With" class="cursorHand" id="beginsWith" data-active="false">
					<img src="images/under-search/searchBox/ends-with.png" title="Ends With" class="cursorHand" id="endsWith" data-active="false">
					<img src="images/under-search/searchBox/wild-card.png" title="Wild Card " class="cursorHand" id="wildCard" data-active="false">
				</div>

				<div class="searchWord-count">
					<p>Search Result Found:</p><span class="count">0</span>
				</div>
				<div class="searchWord-controls">
					<div class="searchWord-Nav">
						<ul>
							<li id="firstPage" data-enable=false class="cursorHand"><img src="images/first.png" title="First Searched Word"></li>
							<li id="prevPage" data-enable=false class="cursorHand"><img src="images/prev.png" title="Previous Searched Word"></li>
							<li id="nextPage" data-enable=false class="cursorHand"><img src="images/next.png" title="Next Searched Word"></li>
							<li id="lastPage" data-enable=false class="cursorHand"><img src="images/last.png" title="Last Searched Word"></li>
						</ul>
					</div>
				</div>


				<div class="searchedWord-container">
					<div class="searchedWord-column">
						<div class="Page">
							<p>Page</p>
						</div>
						<div class="Result">
							<p>Result</p>
						</div>
					</div>

					<div class="searchedWord-row-container">
						<div id="1" class="searchedWord-row">
							<div class="rowPage">
								<p>1</p>
							</div>
							<div class="rowResult">
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu metus in nunc pellentesque consequat. Pellentesque interdum hendrerit mi, id porta diam lacinia et. Vestibulum accumsan dolor vitae augue semper venenatis. Maecenas eu sapien pulvinar sapien pharetra eleifend ac sit amet diam. 
								</p>
							</div>
						</div>

						<div id="2" class="searchedWord-row">
							<div class="rowPage">
								<p>1</p>
							</div>
							<div class="rowResult">
								<p>
									Donec auctor mattis lorem non dignissim. Nam fringilla mi eu purus vehicula, id luctus nisi fermentum.
								</p>
							</div>
						</div>

						<div id="3" class="searchedWord-row">
							<div class="rowPage">
								<p>2</p>
							</div>
							<div class="rowResult">
								<p>
									Nulla et tellus at eros sodales gravida at id velit. Sed iaculis augue turpis, sed lobortis lorem sagittis ac.
								</p>
							</div>
						</div>

						<div id="4" class="searchedWord-row">
							<div class="rowPage">
								<p>2</p>
							</div>
							<div class="rowResult">
								<p>
									Aliquam nec augue justo. Pellentesque sed ipsum non arcu ultrices aliquet sed in nibh.
								</p>
							</div>
						</div>

						<div id="5" class="searchedWord-row">
							<div class="rowPage">
								<p>3</p>
							</div>
							<div class="rowResult">
								<p>
									Nulla ipsum sapien, pellentesque gravida molestie at, porttitor et lectus. Fusce mollis malesuada erat, 
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>


			<!-- Annotation Container -->
			<div class="annotationsContainer">

				<!-- Redact Annotation -->
				<div id="viewer-redactbox" class="notSelected">
					<div class="redactControls">
						<img src="images/under-redact/RedactBox/Fill.png" class="cursorHand selected" id="Redact_fill">
						<img src="images/under-redact/RedactBox/Layers.png" class="cursorHand" id="Redact_index">
					</div>
					<div id="Redact_delete">
						<img src="images/under-redact/RedactBox/Delete.png" class="cursorHand deleteObject">
					</div>


					<div class="containerControls">
						<img src="images/close.png" class="cursorHand" id="closeRedact" title="Close">
						<img src="images/under-redact/RedactBox/Minimize.png" data-resize="minimize" class="cursorHand" id="resizeRedactBox" title="Minimize">
					</div>
					<div class="redactControls-contents">
						<div class="reason-container cursorHand">
							<div class="selected-reason">
								<span title="Redaction Reason">Redaction</span>
								<div class="down-arrow">
									<img src="images/under-redact/RedactBox/down-arrow.png" >
								</div>
							</div>
							<div class="reasons-available-container">
								
							</div>
						</div>
						<div class="layering-controls">
							<img src="images/under-redact/RedactBox/bringfront.png" id="redactionBringFront" class="cursorHand" title="Bring to Front">
							<img src="images/under-redact/RedactBox/movefront.png" id="redactionMoveFront" class="cursorHand" title="Bring Forward">
							<img src="images/under-redact/RedactBox/moveback.png" id="redactionMoveBack" class="cursorHand" title="Send Backward">
							<img src="images/under-redact/RedactBox/bringback.png" id="redactionBringBack" class="cursorHand" title="Send to Back">
						</div>
					</div>
					<!-- <div id="redactionInfiniteBtn" class="red-infinite-app-btn" title="Continuous Application"> <i class="udv-font udv-infinite"></i> </div> -->
				</div>
				<!-- End of Redact Annotation -->
				
				<!-- Shared Annotation Box -->
				<div id="viewer-annotateBox" class="notSelected">
				
					<!-- For Delete Annotation, Close and Resize the ToolBox -->
					<div class="sharedTools">
						<img alt="Delete Annotation" src="images/under-redact/RedactBox/Delete.png" class="cursorHand deleteObject" id="deleteAnnotation">
						<img src="images/close.png" class="cursorHand" title="Close" id="closeAnnotateBox">
						<img src="images/under-redact/RedactBox/Minimize.png" data-resize="minimize" class="cursorHand" id="resizeAnnotateBox" title="Minimize">
					</div>
					
					<div class="annotateBoxTab">
					
						<img alt="Arrow Annotation" src="images/under-redact/arrow.png" id="arrowTab" class="cursorHand" >
						<!-- COMMENT BUTTON -->
						<span class="cursorHand" id="commentTab" title="" style="display: none; font-size: 18px; border: 0; color: #fff; vertical-align: top; padding: 5px;">
							<i class="fa fa-commenting-o" aria-hidden="true"></i>
						</span>
						<!-- COMMENT BUTTON -->
						<i id="tagSetTab" class="fa fa-tags stampIcon cursorHand" title="Tags" aria-hidden="true"></i>
						<i id="imageTab" class="fa fa-tags stampIcon cursorHand" title="Tags" aria-hidden="true"></i>
						<img alt="Line Annotation" src="images/under-redact/line.png" id="lineTab" class="cursorHand" >
						<img alt="Rectangle Annotation" src="images/under-redact/square.png" id="rectTab" class="cursorHand" >
						<img alt="Border" src="images/under-redact/square_border.png" id="rectBorderTab" class="cursorHand" >
						<img alt="Circle Annotation" src="images/under-redact/circle.png" id="circleTab" class="cursorHand" >
						<img alt="Border" src="images/under-redact/circle_border.png" id="circleBorderTab" class="cursorHand" >
						<img alt="Text Annotation" src="images/under-redact/text.png" id="textTab" class="cursorHand" >
						<img alt="Text Style" src="images/under-redact/text-style.png" id="textstyleTab" class="cursorHand" data-bold="false" data-italic="false" data-underline="false" data-strike="false">
						<img alt="Text Alignment" src="images/under-redact/text-alignment.png" id="textAlignTab" class="cursorHand" data-horizontal="center" data-vertical="middle">
						<img alt="Layering" src="images/under-redact/RedactBox/Layers.png" id="layerTab" class="cursorHand">
						<i id="positionTab" class="fa fa-th-large notesIcon cursorHand" title="Position" aria-hidden="true"></i>
						<i id="addNote" class="fa fa-pencil-square-o notesIcon cursorHand" title="Add Note" aria-hidden="true"></i>
						<img src="images/under-redact/stamp.png" class="cursorHand" id="applyStamp">
						<img src="images/under-redact/stamp.png" class="cursorHand" id="applyImage">
					</div>
					
					<div class="tabContent">
						<div class="colorPickerBox cursorHand" title="Color Picker">
							<div class="selectedColor" id="fillColor" style="background:rgb(0, 0, 255)">
								
							</div>
							<div class="down-arrow">
								<img src="images/under-redact/RedactBox/down-arrow.png" >
							</div>
							<div id="availableColors">
								<div style="background:rgb(255, 0, 0)"></div> <!-- red #ff0000 -->
								<div style="background:rgb(255, 255, 0)"></div> <!-- yellow #ffff00 -->
								<div style="background:rgb(255, 165, 0)"></div> <!-- orange ffa500 -->
								<div style="background:rgb(0, 255, 0)"></div> <!-- lime #00ff00 -->
								<div style="background:rgb(0, 255, 255)"></div> <!-- cyan #00ffff -->
								<div style="background:rgb(102, 102, 255)"></div> <!-- light purple #6666ff -->
								<div style="background:rgb(255, 0, 255)"></div> <!-- magenta #ff00ff -->
								<div style="background:rgb(238, 130, 238)"></div> <!-- violet #ee82ee -->
								<div style="background:rgb(204, 204, 204)"></div> <!-- light gray #cccccc -->
								<div style="background:rgb(255, 255, 255)"></div> <!-- white #ffffff -->
								
								<div style="background:rgb(128, 0, 0)"></div> <!-- maroon #800000 -->
								<div style="background:rgb(153, 153, 0)"></div> <!-- yellowish greenish #999900 -->
								<div style="background:rgb(163, 98, 10)"></div> <!-- light brown #a3620a -->
								<div style="background:rgb(0, 128, 0)"></div> <!-- green #008000 -->
								<div style="background:rgb(0, 0, 255)"></div> <!-- blue #0000ff -->
								<div style="background:rgb(51, 51, 204)"></div> <!-- bluish violet #3333cc -->
								<div style="background:rgb(146, 39, 143)"></div> <!-- pinkish purple #92278f -->
								<div style="background:rgb(128, 128, 128)"></div> <!-- gray #808080 -->
								<div style="background:rgb(0, 0, 0)"></div> <!-- black #000000 -->
								<div id="nofillColor" class="nofillColor" data-bgcolor="none" style="background:rgba(176, 176, 176, 0)"></div>
							</div>
						</div>
						
						<!-- TAGSET PROPERTY -->
						
						<div class="stampControlsContainer">
							<div class="tagset-container cursorHand">
								<div class="selected-tagSet">
									<span title="Tag Set">Tag Set</span>
									<div class="down-arrow">
										<img src="images/under-redact/RedactBox/down-arrow.png">
									</div>
								</div>
								<div class="tagSet-available-container"></div>
							</div>
							<div class="tag-container cursorHand">
								<div class="tag-available-container"></div>
								<div class="tag-radio-container"></div>
							</div>
						</div>
						<div class="clear-fix" id="opacityCssTemp" style="display: none;"></div>
						
						<div class="opacityPickerBox cursorHand" title="Opacity Picker">
							<img src="images/under-redact/RedactBox/opacity.png" class="icon notSelected ">
							<div class="selectedArrowOpacity notSelected">
								<span id ="fillOpacity">100%</span>
								<div class="down-arrow">
									<img src="images/under-redact/RedactBox/down-arrow.png" >
								</div>
							</div>
							<div id="availableOpacity" class="notSelected toolBarDropDown">
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0;">0%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.1;">10%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.2;">20%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.3;">30%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.4;">40%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.5;">50%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.6;">60%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.7;">70%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.8;">80%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.9;">90%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 1;">100%</div>
							</div>
						</div>
						
						<div class="widthPickerBox cursorHand" title="Border Width Picker">
							<img src="images/under-redact/RedactBox/lineWidth.png" class="icon notSelected ">
							<div class="selectedArrowWidth notSelected">
								<span id="fillWidth">6</span>
								<div class="down-arrow">
									<img src="images/under-redact/RedactBox/down-arrow.png" >
								</div>
							</div>
							<div id="availableWidth" class="notSelected toolBarDropDown">
								<div class="width-holder"><img src="images/under-redact/border-1.png">1</div>
								<div class="width-holder"><img src="images/under-redact/border-2.png">2</div>
								<div class="width-holder"><img src="images/under-redact/border-3.png">3</div>
								<div class="width-holder"><img src="images/under-redact/border-4.png">4</div>
								<div class="width-holder"><img src="images/under-redact/border-5.png">5</div>
								<div class="width-holder"><img src="images/under-redact/border-6.png">6</div>
								<div class="width-holder"><img src="images/under-redact/border-7.png">7</div>
								<div class="width-holder"><img src="images/under-redact/border-8.png">8</div>
							</div>
						</div>
						
						<div class="fontFacePickerBox cursorHand" title="Font family">
							<div class="selectedTextFont notSelected">
								<span id="fontFace">Arial</span>
								<div class="down-arrow">
									<img src="images/under-redact/RedactBox/down-arrow.png" >
								</div>
							</div>
							<div id="availableFonts" class="notSelected toolBarDropDown">
								<div class="font-holder" title="Arial">Arial</div>
								<div class="font-holder" title="Calibri">Calibri</div>
								<div class="font-holder" title="Comic Sans MS">Comic Sans MS</div>
								<div class="font-holder" title="Courier">Courier</div>
								<div class="font-holder" title="Georgia">Georgia</div>
								<div class="font-holder" title="Tahoma">Tahoma</div>
								<div class="font-holder" title="Times New Roman">Times New Roman</div>
								<div class="font-holder" title="Verdana">Verdana</div>
							</div>
						</div>

						<div class="textSizePickerBox cursorHand" title="Font size">
							<div class="selectedFontSize notSelected">
								<span id="textSize">12</span>
								<div class="down-arrow">
									<img src="images/under-redact/RedactBox/down-arrow.png" >
								</div>
							</div>
							<div id="availableSize" class="notSelected toolBarDropDown">
								<div class="size-holder">8</div>
								<div class="size-holder">9</div>
								<div class="size-holder">10</div>
								<div class="size-holder">11</div>
								<div class="size-holder">12</div>
								<div class="size-holder">14</div>
								<div class="size-holder">16</div>
								<div class="size-holder">18</div>
								<div class="size-holder">20</div>
								<div class="size-holder">22</div>
								<div class="size-holder">24</div>
								<div class="size-holder">26</div>
								<div class="size-holder">28</div>
								<div class="size-holder">30</div>
								<div class="size-holder">36</div>
								<div class="size-holder">48</div>
								<div class="size-holder">72</div>
							</div>
						</div>
						

						<div  class="textStyleContainer">
							<img src="images/under-redact/bold-text.png" id="boldText" class="cursorHand" title="Bold">
							<img src="images/under-redact/italic-text.png" id="italicText" class="cursorHand" title="Italic">
							<img src="images/under-redact/underline.png" id="underlineText" class="cursorHand" title="Underline">
							<img src="images/under-redact/strikeout.png" id="strikeoutText" class="cursorHand" title="Strikethrough">
						</div>		
						
						<div  class="textAlignContainer">
							<img src="images/under-redact/left-align.png" id="leftAlign" class="cursorHand" title="Left">
							<img src="images/under-redact/text-alignment.png" id="centerAlign" class="cursorHand" title="Center">
							<img src="images/under-redact/right-align.png" id="rightAlign" class="cursorHand" title="Right">
							
							<span class="seperator-line"><img src="images/under-redact/seperator-line.png"></span>
							
							<div class="verticalAlignContainer">
								<img src="images/under-redact/top-align.png" id="topAlign" class="cursorHand" title="Top">
								<img src="images/under-redact/middle-align.png" id="middleAlign" class="cursorHand" title="Middle">
								<img src="images/under-redact/bottom-align.png" id="bottomAlign" class="cursorHand" title="Bottom">
							</div>
						</div>		
						
						<div class="layerContainer">
							<img src="images/under-redact/RedactBox/bringfront.png" id="annotationBringFront" class="cursorHand" title="Bring to Front">
							<img src="images/under-redact/RedactBox/movefront.png" id="annotationMoveFront" class="cursorHand" title="Bring Forward">
							<img src="images/under-redact/RedactBox/moveback.png" id="annotationMoveBack" class="cursorHand" title="Send Backward">
							<img src="images/under-redact/RedactBox/bringback.png" id="annotationBringBack" class="cursorHand" title="Send to Back">
						</div>
						
						<div class="positionContainer">
							<input type="radio" name="notePosition" value="topLeft" checked>top-left<br>
							<input type="radio" name="notePosition" value="topRight">top-right<br>
							<input type="radio" name="notePosition" value="bottomLeft">bottom-left<br>
							<input type="radio" name="notePosition" value="bottomRight">bottom-right<br>
						</div>
						
						<!-- COMMENT PROPERTY -->
						<div class="commentContainer" style="display: block;">
						  <div style="position: relative">
							<textarea class="comment-field" id="commentField" placeholder="Add comment..."></textarea> <!-- maxlength="255" -->
						    <button class="clear-comment-btn" title="Clear Comment">
						    	<i class="fa fa-times" aria-hidden="true"></i>
						    </button>
						  </div>
						</div>
						
						<!-- IMAGE PROPERTY -->
						<div class="imageContainer" style="display: block;">
						  <div style="position: relative">
						  	<label style="color:white">Image:</label><br>
							<img id="imagePreview" style="width:200px; height:130px; background-color:white;">
						  </div>
						</div>
						
					</div>
					
					
					<!-- <div id="annotationInfiniteBtn" class="ann-infinite-app-btn" title="Continuous Application"> <i class="udv-font udv-infinite"></i> </div> -->
					
				</div>
				<!-- Shared Annotation Box -->
				
				<!-- Shared Collab Box -->
				<div id="viewer-collabBox" class="notSelected">
					<div class="collabBoxTab">
						<img alt="Arrow Annotation" src="images/under-redact/arrow.png" id="arrowTab" class="cursorHand" >
						<img alt="Line Annotation" src="images/under-redact/line.png" id="lineTab" class="cursorHand" >
						<img alt="Rectangle Annotation" src="images/under-redact/square.png" id="rectTab" class="cursorHand" >
						<img alt="Border" src="images/under-redact/square_border.png" id="rectBorderTab" class="cursorHand" >
						<img alt="Circle Annotation" src="images/under-redact/circle.png" id="circleTab" class="cursorHand" >
						<img alt="Border" src="images/under-redact/circle_border.png" id="circleBorderTab" class="cursorHand" >
						<img alt="Text Annotation" src="images/under-redact/text.png" id="textTab" class="cursorHand" >
						<img alt="Text Style" src="images/under-redact/text-style.png" id="textstyleTab" class="cursorHand" data-bold="false" data-italic="false" data-underline="false" data-strike="false">
						<img alt="Text Alignment" src="images/under-redact/text-alignment.png" id="textAlignTab" class="cursorHand" data-horizontal="center" data-vertical="middle">
						<img alt="Layering" src="images/under-redact/RedactBox/Layers.png" id="layerTab" class="cursorHand">
					</div>
					
					<div class="tabContent">
						<div class="colorPickerBox cursorHand" title="Color Picker">
							<div class="selectedColor" id="fillColor" style="background:rgb(0, 0, 255)">
								
							</div>
							<div class="down-arrow">
								<img src="images/under-redact/RedactBox/down-arrow.png" >
							</div>
							<div id="availableColors">
								<div style="background:rgb(255, 0, 0)"></div> <!-- red #ff0000 -->
								<div style="background:rgb(255, 255, 0)"></div> <!-- yellow #ffff00 -->
								<div style="background:rgb(255, 165, 0)"></div> <!-- orange ffa500 -->
								<div style="background:rgb(0, 255, 0)"></div> <!-- lime #00ff00 -->
								<div style="background:rgb(0, 255, 255)"></div> <!-- cyan #00ffff -->
								<div style="background:rgb(102, 102, 255)"></div> <!-- light purple #6666ff -->
								<div style="background:rgb(255, 0, 255)"></div> <!-- magenta #ff00ff -->
								<div style="background:rgb(238, 130, 238)"></div> <!-- violet #ee82ee -->
								<div style="background:rgb(204, 204, 204)"></div> <!-- light gray #cccccc -->
								<div style="background:rgb(255, 255, 255)"></div> <!-- white #ffffff -->
								
								<div style="background:rgb(128, 0, 0)"></div> <!-- maroon #800000 -->
								<div style="background:rgb(153, 153, 0)"></div> <!-- yellowish greenish #999900 -->
								<div style="background:rgb(163, 98, 10)"></div> <!-- light brown #a3620a -->
								<div style="background:rgb(0, 128, 0)"></div> <!-- green #008000 -->
								<div style="background:rgb(0, 0, 255)"></div> <!-- blue #0000ff -->
								<div style="background:rgb(51, 51, 204)"></div> <!-- bluish violet #3333cc -->
								<div style="background:rgb(146, 39, 143)"></div> <!-- pinkish purple #92278f -->
								<div style="background:rgb(128, 128, 128)"></div> <!-- gray #808080 -->
								<div style="background:rgb(0, 0, 0)"></div> <!-- black #000000 -->
								<div id="nofillColor" class="nofillColor" data-bgcolor="none" style="background:rgba(176, 176, 176, 0)"></div>
							</div>
						</div>
						
						<div class="opacityPickerBox cursorHand" title="Opacity Picker">
							<img src="images/under-redact/RedactBox/opacity.png" class="icon notSelected ">
							<div class="selectedArrowOpacity notSelected">
								<span id ="fillOpacity">100%</span>
								<div class="down-arrow">
									<img src="images/under-redact/RedactBox/down-arrow.png" >
								</div>
							</div>
							<div id="availableOpacity" class="notSelected toolBarDropDown">
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0;">0%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.1;">10%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.2;">20%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.3;">30%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.4;">40%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.5;">50%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.6;">60%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.7;">70%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.8;">80%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 0.9;">90%</div>
								<div class="opacity-holder"><img src="images/under-redact/RedactBox/opacity.png" style="opacity: 1;">100%</div>
							</div>
						</div>
						
						<div class="widthPickerBox cursorHand" title="Border Width Picker">
							<img src="images/under-redact/RedactBox/lineWidth.png" class="icon notSelected ">
							<div class="selectedArrowWidth notSelected">
								<span id="fillWidth">6</span>
								<div class="down-arrow">
									<img src="images/under-redact/RedactBox/down-arrow.png" >
								</div>
							</div>
							<div id="availableWidth" class="notSelected toolBarDropDown">
								<div class="width-holder"><img src="images/under-redact/border-1.png">1</div>
								<div class="width-holder"><img src="images/under-redact/border-2.png">2</div>
								<div class="width-holder"><img src="images/under-redact/border-3.png">3</div>
								<div class="width-holder"><img src="images/under-redact/border-4.png">4</div>
								<div class="width-holder"><img src="images/under-redact/border-5.png">5</div>
								<div class="width-holder"><img src="images/under-redact/border-6.png">6</div>
								<div class="width-holder"><img src="images/under-redact/border-7.png">7</div>
								<div class="width-holder"><img src="images/under-redact/border-8.png">8</div>
							</div>
						</div>
						
						<div class="fontFacePickerBox cursorHand" title="Font family">
							<div class="selectedTextFont notSelected">
								<span id="fontFace">Arial</span>
								<div class="down-arrow">
									<img src="images/under-redact/RedactBox/down-arrow.png" >
								</div>
							</div>
							<div id="availableFonts" class="notSelected toolBarDropDown">
								<div class="font-holder" title="Arial">Arial</div>
								<div class="font-holder" title="Calibri">Calibri</div>
								<div class="font-holder" title="Comic Sans MS">Comic Sans MS</div>
								<div class="font-holder" title="Courier">Courier</div>
								<div class="font-holder" title="Georgia">Georgia</div>
								<div class="font-holder" title="Tahoma">Tahoma</div>
								<div class="font-holder" title="Times New Roman">Times New Roman</div>
								<div class="font-holder" title="Verdana">Verdana</div>
							</div>
						</div>

						<div class="textSizePickerBox cursorHand" title="Font size">
							<div class="selectedFontSize notSelected">
								<span id="textSize">12</span>
								<div class="down-arrow">
									<img src="images/under-redact/RedactBox/down-arrow.png" >
								</div>
							</div>
							<div id="availableSize" class="notSelected toolBarDropDown">
								<div class="size-holder">8</div>
								<div class="size-holder">9</div>
								<div class="size-holder">10</div>
								<div class="size-holder">11</div>
								<div class="size-holder">12</div>
								<div class="size-holder">14</div>
								<div class="size-holder">16</div>
								<div class="size-holder">18</div>
								<div class="size-holder">20</div>
								<div class="size-holder">22</div>
								<div class="size-holder">24</div>
								<div class="size-holder">26</div>
								<div class="size-holder">28</div>
								<div class="size-holder">30</div>
								<div class="size-holder">36</div>
								<div class="size-holder">48</div>
								<div class="size-holder">72</div>
							</div>
						</div>
						

						<div  class="textStyleContainer">
							<img src="images/under-redact/bold-text.png" id="boldText" class="cursorHand" title="Bold">
							<img src="images/under-redact/italic-text.png" id="italicText" class="cursorHand" title="Italic">
							<img src="images/under-redact/underline.png" id="underlineText" class="cursorHand" title="Underline">
							<img src="images/under-redact/strikeout.png" id="strikeoutText" class="cursorHand" title="Strikethrough">
						</div>		
						
						<div  class="textAlignContainer">
							<img src="images/under-redact/left-align.png" id="leftAlign" class="cursorHand" title="Left">
							<img src="images/under-redact/text-alignment.png" id="centerAlign" class="cursorHand" title="Center">
							<img src="images/under-redact/right-align.png" id="rightAlign" class="cursorHand" title="Right">
							
							<span class="seperator-line"><img src="images/under-redact/seperator-line.png"></span>
							
							<div class="verticalAlignContainer">
								<img src="images/under-redact/top-align.png" id="topAlign" class="cursorHand" title="Top">
								<img src="images/under-redact/middle-align.png" id="middleAlign" class="cursorHand" title="Middle">
								<img src="images/under-redact/bottom-align.png" id="bottomAlign" class="cursorHand" title="Bottom">
							</div>
						</div>		
						
						<div class="layerContainer">
							<img src="images/under-redact/RedactBox/bringfront.png" id="annotationBringFront" class="cursorHand" title="Bring to Front">
							<img src="images/under-redact/RedactBox/movefront.png" id="annotationMoveFront" class="cursorHand" title="Bring Forward">
							<img src="images/under-redact/RedactBox/moveback.png" id="annotationMoveBack" class="cursorHand" title="Send Backward">
							<img src="images/under-redact/RedactBox/bringback.png" id="annotationBringBack" class="cursorHand" title="Send to Back">
						</div>
					</div>
					
					<!-- <div id="annotationInfiniteBtn" class="ann-infinite-app-btn" title="Continuous Application"> <i class="udv-font udv-infinite"></i> </div> -->
					
					<!-- For Delete Annotation, Close and Resize the ToolBox -->
					<div class="sharedTools">
						<img alt="Delete Annotation" src="images/under-redact/RedactBox/Delete.png" class="cursorHand deleteObject" id="deleteCollab">
						<img src="images/close.png" class="cursorHand" title="Close" id="closeCollabBox">
						<img src="images/under-redact/RedactBox/Minimize.png" data-resize="minimize" class="cursorHand" id="resizeCollabBox" title="Minimize">
					</div>
					
				</div>
				<!-- Shared Collab Box -->
				
			</div>
			
			
			<!-- Delete Multiple Select -->
			<div id="deleteMultiple">
				<div id="multiple_delete">
					<img src="images/under-redact/RedactBox/Delete.png" class="cursorHand" title="Delete Selected">
				</div>
				<div class="containerControls">
					<img src="images/close.png" class="cursorHand" id="closeMultipleDelete" title="Close">
					<img src="images/under-redact/RedactBox/Minimize.png" data-resize="minimize" class="cursorHand" id="resizeMultipleDelete" title="Minimize">
				</div>
			</div>
			<!-- End Delete Multiple Select -->
			
			<!-- End of Annotations Container -->


			<!-- Notification -->
			<div id="DV-Notif">
				<img class="icon-Notif">
				<div class="notif-msg">
					<p id="textMsg"></p>
				</div>
				<!-- <button id="close-Notif">x</button> -->
				<i id="close-Notif" class="fa fa-times"></i>
			</div>
			
			<!-- Preloader -->
			<div id="PreloaderModal">
				<p class="preloader-status">Generating Page <span id="cur_generate_no">1</span> of <span id="to_generate_no">5</span></p>
				<div class="loader"></div>
				<div id="PreloaderBarContainer">
					<div id="preloaderBarFill"></div>
				</div>
				<span id="cancelPrinting" class="printModalButtons">
					<p>Cancel</p>
				</span>
			</div>
			
			
			
			
			<!-- Printing Form -->
			<div id="DV-PrintModal">
				<div class="print-dialog">
						<!--  <span class="closeModal" id="closePrintModal">
						<img src="images/close.png">
					</span>-->
					<div id="includeSection">
						<p class="sectionTitle">Include</p>
						
						<div id="prRedactCheckBoxDiv" class="sectionChoices">
							<input id="w_redaction" type="checkbox" checked name="includeRedaction"/>
							<label>Print with Redaction</label>
						</div>
						<div class="sectionChoices">
							<input id="w_annotation"type="checkbox" name="includeAnnotation"/>
							<label>Print with Annotation</label>
						</div>
					</div>
					
					<div id="orientationSection">
						<p class="sectionTitle">Orientation</p>
						
						<div class="sectionChoices">
							<input id="orient_auto" type="radio" checked name="orientation"/>
							<label>Auto Portrait / Landscape</label>
						</div>
						<div class="sectionChoices">
							<input id="orient_port"type="radio" name="orientation"/>
							<label>Portrait</label>
						</div>
						<div class="sectionChoices">
							<input id="orient_land"type="radio" name="orientation"/>
							<label>Landscape</label>
						</div>
					</div>
					
					<div id="printOptSection">
						<p class="sectionTitle">Printing Options</p>
						<div class="sectionChoices">
							<input id="printAll"type="radio" checked name="printingOpt"/>
							<label>Print All Pages</label>
						</div>
						<div class="sectionChoices">
							<input id="printCurrent" type="radio" name="printingOpt"/>
							<label>Print Current Page</label>
						</div>
					</div>
					
					
					<div class="printButtonContainer">
						<div id="printDoc" class="printModalButtons">
							<p>Print</p>
						</div>
						
						<div id="cancelPrintDoc" class="printModalButtons">
							<p>Cancel</p>
						</div>
					</div>
				</div>
			</div>

			
			
			<!-- ANNOTATION NAVIGATION -->
			<%--
			<!-- disabled Annotation Navigation manually for JurisLib Integration. This function is not yet done in udv 3.0 -->
			<div class="drawing-nav">
				
				<button id="minimize" title="Hide Navigation"><i class="fa fa-minus-square-o"></i></button>	
				<button id="maximize" title="Show Navigation"><i class="fa fa-plus-square-o"></i></button>
				
				<button id="switch" title="Switch to Redaction"><i class="fa fa-exchange"></i></button>
				
				<label id="navLabel">Navigate Annotation</label>
				<div>
					<button title="Previous" id="previousDraw"><i class="fa fa-caret-left"></i></button>
					<button title="Next" id="nextDraw"><i class="fa fa-caret-right"></i></button>
				</div>
				
				<span class="position">
					<p>Current: <span id="currentPosition">0</span></p>
					<!-- <p>Type: <span id="currentType">Arrow</span></p> -->
					<p>Total: <span id="totalObjectAnnotation">0</span><span style="display: none" id="totalObjectRedation">0</span></p>
				</span>
				
				
				
				<!-- <div class="stats">
					<div class="annotations green" title="Arrow"></div><p>1</p>
					<div class="annotations blue" title="Line"></div><p>2</p>
					<div class="annotations orange" title="Square"></div><p>3</p>
					<div class="annotations red" title="Circle"></div><p>4</p>	
					<div class="annotations white" title="Text"></div><p>5</p>
					<div class="annotations purple" title="Highlight"></div><p>6</p>
				</div>  -->
			</div>
			--%>
			<!-- END OF ANNOTATION NAVIGATION -->
			
			
			<!-- Main Document Viewer -->
			
			
			<div id="viewerContainerParent" style="border: 1px solid #d8d8d8; padding: 0 1px;">
				<div id="viewerContainer">
					<div id="viewer-document-wrapper">
						
					</div>
					
					<!-- DOWNLOAD OPTIONS MODAL -->
					<div class="modal fade" id="downloadModal" tabindex="-1" role="dialog" aria-labelledby="downloadModalLabel" data-backdrop="static" data-keyboard="false">
						<div class="modal-dialog modal-sm" role="document">
							<div class="modal-content modal-sm">
								<div class="modal-header">
									<button type="button" id="closeDownloadBtn" class="close pull-right" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="fa fa-times"></i></span></button>
									<h4 class="modal-title" id="myModalLabel">Download Options</h4>
								</div>
								<div class="modal-body">

									<!-- <div id="downloadOption">
										<label>Make good choices</label>
										<input type="radio" name="dlAnnotationOptions" value="Include Redaction"><span>Include Redaction</span><br>
										<input type="radio" name="dlAnnotationOptions" value="Include Annotation"><span>Include Annotation</span><br>
										<input type="radio" name="dlAnnotationOptions" value="Document Only"><span>Document Only</span>
									</div> -->

									<div id="downloadOption">
										<label>PDF Download Option</label>
										<div class="option-container">
											<div id="dlRedactCheckBoxDiv" class="rc-container"><input type="checkbox" id="dlRedactCheckBox" value="Include Redaction" class="abc"><span>Include Redactions</span></div><br>
											<div class="ac-container"><input type="checkbox" id="dlAnnotationCheckBox" value="Include Annotation" class="abc"><span>Include Annotations</span><br></div>
											<!-- <input type="checkbox" id="documentCheckBox" value="Document Only" checked><span>Document Only</span> -->
										</div>
									</div>

									<div id="orientationOption">
										<label class="label">Orientation</label>
										<input id="portraitOrientation" type="radio" checked name="orientation"><span>Portrait</span><br>
										<input id="landScapeOrientation" type="radio" name="orientation"><span>Landscape</span>
									</div>
									
									<!-- THIS IS FOR OTHER OPTIONS -->
									<div id="annotationOption">
										<label>Annotation</label>
										<input type="checkbox" name="dlAnnotationOptions" value="Include Redaction"><span>Include Redaction</span><br>
										<input type="checkbox" name="dlAnnotationOptions" value="Include Annotation"><span>Include Annotation</span><br>
										<input type="checkbox" name="dlAnnotationOptions" value="Document Only"><span>Document Only</span>
									</div>
									<div id="redactionOption">
										<label>Redaction</label>
										<input type="checkbox" name="dlRedactionOptions" value="Include Redaction"><span>Include Redaction</span><br>
										<input type="checkbox" name="dlRedactionOptions" value="Include Annotation"><span>Include Annotation</span><br>
										<input type="checkbox" name="dlRedactionOptions" value="Document Only"><span>Document Only</span>
									</div>
									<!-- THIS IS FOR OTHER OPTIONS -->

								</div>
								<div class="modal-footer">
									<span id="downloadNote" class="note pull-left bounce"><i class="fa fa-exclamation-triangle"></i> Please try to download the document again.</span>
									<button type="button" id="downloadBtn" class="btn btn-primary">Download</button>
									<button type="button" id="cancelDownloadBtn" class="btn btn-default" data-dismiss="modal">Cancel</button>
								</div>
							</div>
						</div>
					</div>
					<!-- DOWNLOAD OPTIONS MODAL -->
					
					<!-- FULL PAGE REDACTION OPTIONS MODAL -->
					<div class="modal fade" id="redactionModal" tabindex="-1" role="dialog" aria-labelledby="redactionModalLabel" data-backdrop="static" data-keyboard="false">
						<div class="modal-dialog modal-sm" role="document">
							<div class="modal-content modal-md">
								<div class="modal-header">
									<button type="button" id="closeRedactionBtn" class="close pull-right" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="fa fa-times"></i></span></button>
									<h4 class="modal-title" id="myModalLabel">Full Page Redaction Option</h4>
								</div>
								<div class="modal-body">

									<div id="fullPageRedactionOption">
										<label>Full Page Redaction Option</label>
										<div class="option-container">
											<div><label>Reason:</label><select id="selectReason"></select></div>
											<div>
												<label style="padding: 0 1px 0 0;">Pages:</label>
												<input type="text" id="pagesId">
												<span id="page-note"><i class="fa fa-exclamation-circle"></i> Please Enter pages.</span><span class="clear-fix"></span>
											</div>
										</div>
									</div>
								</div>
								<div class="modal-footer">
									<span id="fpRedactionNote" class="pull-left bounce">
										<i class="fa fa-bell"></i> 
										Note: Enter page numbers separated by a comma and/or page ranges separated by a dash. Example: 1,2-5,10
									</span>
									<button type="button" id="redactionBtn" class="btn btn-primary">Apply</button>
									<button type="button" id="cancelfpRedactionBtn" class="btn btn-default" data-dismiss="modal">Cancel</button>
								</div>
							</div>
						</div>
					</div>
					<!-- FULL PAGE REDACTION OPTIONS MODAL -->
					
					<!-- REDACTION PATTERN MODAL -->
					<div class="modal fade redact-pattern-modal" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false">
						<div class="modal-dialog">
							<div class="modal-content">
								<div class="modal-header">
									<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
									<h4 class="modal-title">Modal title</h4>
								</div>
								<div class="modal-body">
									<div class="pattern-options">
										<label>Redaction Pattern Options</label>
										<div class="option-container">
											<div>
												<label>Reason:</label>
												<select id="patternReason">
												</select>
											</div>
											<div>
												<label style="padding: 0 5px 0 0;">Pattern:</label>
												<select id="redactPattern">
												</select>
												<!-- <input type="text" id="pagesId"> -->
												<!-- <span id="page-note"><i class="fa fa-exclamation-circle"></i> Please Enter pages.</span><span class="clear-fix"></span> -->
											</div>
										</div>
									</div>
								</div>
								<div class="modal-footer">
									<button type="button" class="btn" id="applyPattern" data-dismiss="modal">Apply</button>
									<button type="button" class="btn" id="applyAndSavePattern" data-dismiss="modal">Apply and Save</button>
									<button type="button" class="btn" id="cancelPattern" data-dismiss="modal">Cancel</button>
								</div>
							</div><!-- /.modal-content -->
						</div><!-- /.modal-dialog -->
					</div><!-- /.modal -->
					<!-- REDACTION PATTERN MODAL -->
					
				</div>
			</div>
		</div>
		<!-- End of Main Document Viewer -->
		<div id="viewer-footer" class="noselect">
			<p id="docViewerVersion"></p>
		</div>
	</div>
	<textarea id="textAreaContainer" spellcheck="false" style="display: none "></textarea>
	
	
	
	<script src="js/api/html5shiv.js"></script>
	<script src="js/api/html5shiv-printshiv.js"></script>
	<script src="js/api/jquery.js"></script>
	<script src="js/gunzip.min.js"></script>
	<!-- CHANGE SNAP.SVG.JS ONLY WHEN NECESSARY!!! THERE IS CUSTOM CODE WITHIN SNAP.SVG.JS BEING USED BY UDV FOR DRAGGING!!! -->
	<script src="js/api/snap.svg.js"></script>
	<script src="js/api/dragScroll.js"></script>
	<script src="js/api/ElementQueries.js"></script>
	<script src="js/api/ResizeSensor.js"></script>
	<script type="text/javascript" src="js/api/inputGroup.min.js"></script>
	
	<script src="js/udvWS.js"></script>
	<script src="js/annotationDraw.js"></script>
	<script src="js/annotationNavigation.js"></script>
	<script src="js/commons.js"></script>
	<script src="js/constants.js"></script>
	<script src="js/declaration.js"></script>
	<script src="js/documentLoading.js"></script>
	<script src="js/documentSaving.js"></script>
	<script src="js/downloadOption.js"></script>
	<script src="js/draggable.js"></script>
	<script src="js/dropDown_prototype.js"></script>
	<script src="js/main.js"></script>
	<script src="js/multipleDelete.js"></script>
	<script src="js/msgBox.js"></script>
	<script src="js/redactBox.js"></script>
	<script src="js/stampBox.js"></script>
	<script src="js/searchBox.js"></script>
	<script src="js/zoomFunctions.js"></script>
	<script src="js/rotateFunctions.js"></script>
	<script src="js/printDocument.js"></script>
	<script src="js/visibilityMode.js"></script>
	<script src="js/fullScreen.js"></script>
	<script src="js/svgCaching.js"></script>
	<script src="js/fullPageRedactionModal.js"></script>
	<script src="js/copy.js"></script>
	<script src="js/collabTab.js"></script>
	<script src="js/magnifyingGlass.js"></script>
	
	 <!-- comment out this line for development mode 
	<script src="js/udv-min.js"></script>
-->
<script language="javascript">
documentViewer = new UDViewer(JSON.parse('<%=request.getAttribute("config")%>'));
documentViewer.printTemplateStr = '<%=request.getAttribute("printTemplate")%>';
</script>
</body>
</html>