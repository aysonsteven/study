package com.icomteq.udv.config;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.ServletContext;

import org.json.simple.JSONArray;
import org.json.JSONObject;

import com.icomteq.udv.constants.UDVViewerPropertyConstants;
import com.icomteq.udv.util.UDVJSONUtil;

import lombok.extern.log4j.Log4j;

@Log4j
public class UDVConstants {

	private static String docViewerVersion ="";
    private static String domain ="";
    private static ServletContext CONTEXT;
    private static Boolean showRedactTab = Boolean.TRUE;
    private static Boolean showRedactionPattern = Boolean.TRUE;
    private static Boolean showAnnotateTab = Boolean.TRUE;
    private static Boolean allowAutoGeneration = Boolean.TRUE;
    private static Boolean excludeRotation = Boolean.FALSE;
    private static Boolean allowRotation = Boolean.TRUE;
    private static Boolean allowOverride = Boolean.TRUE;
    private static Boolean allowSaving = Boolean.TRUE;
    private static Boolean allowPrinting = Boolean.TRUE;
    private static Boolean allowDownloading = Boolean.TRUE;
    private static Boolean isFitOnLoad = Boolean.FALSE;
    private static String defaultTab = "page";
	private static String highlightColor = "";
	private static String scaleFactor = "1";
	private static JSONArray patternList = new JSONArray(); 
	private static String patternPath = "";

	private static final String SERVER_WHITE_LIST = "server.whitelist";
	private static final Set<String> SERVER_LIST = new HashSet<String>();
    public static final JSONObject ANNOTATION_CONFIGURATION = new JSONObject();
    
    public static Boolean isAllowSaving()
    {
    	return allowSaving;
    }
    
    public static Boolean isAllowPrinting()
    {
    	return allowPrinting;
    }
    
    public static Boolean isAllowDownloading()
    {
    	return allowDownloading;
    }
    
    public static Boolean isOverride()
    {
    	return allowOverride;
    }
    
    public static Boolean isAllowRotation()
    {
    	return allowRotation;
    }
    
    public static Boolean isExcludeRotation()
    {
    	return excludeRotation;
    }
    
    public static Boolean isShowRedactTab()
    {
    	return showRedactTab;
    }
    
    public static Boolean isShowRedactionPattern()
    {
    	return showRedactionPattern;
    }
    
    public static Boolean isShowAnnotateTab()
    {
    	return showAnnotateTab;
    }
    
    public static Boolean isAutoGeneration()
    {
    	return allowAutoGeneration;
    }
    
	public static String getHighlightColor()
	{
		return UDVConstants.highlightColor;
	}
	
	public static String getDocViewerVersion() {
		return UDVConstants.docViewerVersion;
	}

	public static String getDomain()
	{
		return UDVConstants.domain;
	}
	
    public static Boolean isFitOnLoad() {
		return isFitOnLoad;
	}
    
    public static String getDefaultTab() {
		return UDVConstants.defaultTab;
	}
    
	public static void setDefaultTab(String tab) {
		UDVConstants.defaultTab = tab;
	}
	
	public static String getPatternPath() {
		return patternPath;
	}

	public static void setIsFitOnLoad(Boolean isFitOnLoad) {
		UDVConstants.isFitOnLoad = isFitOnLoad;
	}

	public static JSONArray getPatternList() {
		return patternList;
	}

	public static void loadConfig()
	{
	    domain = getServletAttribute("udv.url");
	    docViewerVersion = getServletAttribute("documentViewer.version");
	    allowAutoGeneration = Boolean.valueOf(getServletAttribute("auto.generation"));
	    allowOverride = Boolean.valueOf(getServletAttribute("override"));
	    allowRotation = Boolean.valueOf(getServletAttribute("allow.rotation"));
	    excludeRotation = Boolean.valueOf(getServletAttribute("exclude.rotation"));
	    showAnnotateTab = Boolean.valueOf(getServletAttribute("tab.annotation"));
	    showRedactTab = Boolean.valueOf(getServletAttribute("tab.redact"));
	    showRedactionPattern = Boolean.valueOf(getServletAttribute("redaction.pattern"));
	    allowSaving = Boolean.valueOf(getServletAttribute("saving"));
	    allowPrinting = Boolean.valueOf(getServletAttribute("print"));
	    allowDownloading = Boolean.valueOf(getServletAttribute("download"));
	    isFitOnLoad = Boolean.valueOf(getServletAttribute("fit.on.load"));
	    String newColor = getServletAttribute("search.highlight.color");
	    if(newColor!=null && !newColor.isEmpty() && newColor.indexOf("rgb(")>-1 && newColor.indexOf(")")>-1)
	    	highlightColor = getServletAttribute("search.highlight.color");
	    
	    String defaultTab = String.valueOf(getServletAttribute("tab.default"));
	    
	    if(defaultTab!=null && !defaultTab.isEmpty() && UDVViewerPropertyConstants.isValidTab(defaultTab))
	    {
	    	UDVConstants.defaultTab = defaultTab;	    	
	    }
 
	    patternPath = getServletAttribute("search.pattern.path");
	    if(patternPath!=null && !patternPath.isEmpty())
	    {
	    	patternList = UDVJSONUtil.retrievePatternNameAndIndex(patternPath);
	    }
	    else
	    {
	    	//Load default configuration for e-mail regex
			patternPath = "searchPattern.properties";
			patternList = UDVJSONUtil.retrievePatternNameAndIndex(UDVConstants.class.getClassLoader().getResourceAsStream(patternPath));
	    }
	    
		String hostList  = getServletAttribute(SERVER_WHITE_LIST);
		System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		System.out.println(hostList);
		if(SERVER_LIST.size()==0 && (hostList!=null && !hostList.isEmpty()))
		{
			 String[] list = hostList.split(",");
			 SERVER_LIST.addAll(Arrays.asList(list));
		}

	}
	
	private static String getServletAttribute(String sname) {
	    	try {
			return (String) CONTEXT
					.getAttribute(sname)
					.toString()
					.trim();
		}
    	catch (NullPointerException ex) {
    		log.warn("PROPERTY ["+sname+"] IS NOT EXISTING IN SERVERCONFIG");
		} 	
	    catch (Exception ex) {
			ex.printStackTrace();
		}
		return null;
    }
    
    public static void setContext(ServletContext context)
	{
		CONTEXT = context;
	}
    
	public static Boolean isHostAllowed(String requestingHost)
	{
		if(SERVER_LIST.size()==0)
		{
			//System.out.println("NO EXCEPTION LIST. ALLOWING ALL HOSTS.");
			return Boolean.TRUE;
		}

		return SERVER_LIST.contains(requestingHost);
	}

	public static String getScaleFactor() {
		return scaleFactor;
	}

	public static void setScaleFactor(String scaleFactor) {
		UDVConstants.scaleFactor = scaleFactor;
	}
	
	
}
