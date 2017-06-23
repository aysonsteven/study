package com.icomteq.udv.viewer;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map.Entry;
import java.util.Properties;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.icomteq.udv.config.UDVConstants;
import com.icomteq.udv.util.UDVJSONUtil;
import com.icomteq.udv.viewer.UAgentInfo;


/**
 * Servlet implementation class UDVViewer
 */
public class UDVViewer extends HttpServlet {
	private static final long serialVersionUID = 1L;
    private static Logger log; 
    /**
     * @see HttpServlet#HttpServlet()
     */
    public UDVViewer() {
        super();
        // TODO Auto-generated constructor stub
    }
    
    static
    {
    	log = LoggerFactory.getLogger(UDVViewer.class);
    	UDVConstants.loadConfig();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		try
		{
			
			if(UDVConstants.isHostAllowed(request.getRemoteHost()))
			{
				// TODO Auto-generated method stub
				UAgentInfo ua = new UAgentInfo(request);
				Boolean isMobile = ua.detectMobileLong();
				String client = "["+request.getRemoteHost()+"]["+request.getRemoteAddr()+"]";
				response.addHeader("Access-Control-Allow-Origin", "*"); //change asterisk then put allowed domains for 
				response.addHeader("Access-Control-Allow-Methods",
						"GET, PUT, POST, OPTIONS, DELETE");
				response.addHeader("Access-Control-Allow-Headers", "Content-Type");
				response.addHeader("Access-Control-Max-Age", "86400");
				//UDVConfig.loadConfig(this.getServletContext().getResource("/WEB-INF/web.xml"));
				
				String docViewerVersion = UDVConstants.getDocViewerVersion();
				String udvPrintTemplatePath = getServletContext().getRealPath("/") + "/templates/udvPrintTemplate.html";
				String udvPrintTemplateStr = getFileContent(udvPrintTemplatePath);
				String redactionReason;
				String stampData = "";
				String markupPath = "";
				String document = "";
				String timezone = "";
				String defaultTab = UDVConstants.getDefaultTab();
				Boolean allowRotation = UDVConstants.isAllowRotation();
				String rotationMarkupPath = "";
				Boolean excludeRotation = UDVConstants.isExcludeRotation();
				Boolean autoGeneration = UDVConstants.isAutoGeneration();
				Boolean showRedactTab = UDVConstants.isShowRedactTab();
				Boolean showRedactPattern = UDVConstants.isShowRedactionPattern();
				Boolean showAnnotateTab = UDVConstants.isShowAnnotateTab();
				String highlightColor = UDVConstants.getHighlightColor();
				Boolean isOverride = UDVConstants.isOverride();
				Boolean isFitOnLoad = UDVConstants.isFitOnLoad();
				Boolean allowPrint = UDVConstants.isAllowPrinting();
				Boolean allowDownload = UDVConstants.isAllowDownloading();
				Boolean isJPLT = false;
				String userId = "";
				String scaleFactor = UDVConstants.getScaleFactor(); 
				String libUdvSearchQuery = "";
				String imagePath = "";
				log.info("Request received from ["+client+"]");
				log.debug("Is request secure? "+request.isSecure());
				log.debug("Is client using mobile? "+isMobile);
				log.debug("Verifying values");
				log.debug("Protocol used: "+request.getPathInfo());

				for(Object obj : request.getParameterMap().entrySet())
				{
					Entry<String, String[]> ent = (Entry<String, String[]>) obj;
					log.debug(ent.getKey() + " = "+ ent.getValue()[0]);
				}
				
				if(request.getParameter("doc")!=null)
					document = request.getParameter("doc");
				else
					document = "Sample.pdf";
				
				if(request.getParameter("timezone")!=null)
					timezone = request.getParameter("timezone");
				
				if(request.getParameter("userId")!=null)
					userId = request.getParameter("userId");
				
				
				if(request.getParameter("redactionReasons")!=null)
					redactionReason = (String) request.getParameter("redactionReasons");
				else
					redactionReason = "Redaction";
				
				if(request.getParameter("stampData")!=null)
					stampData = (String) request.getParameter("stampData");
				
				if(request.getParameter("markupPath")!=null)
					markupPath = (String) request.getParameter("markupPath");
				
				if(request.getParameter("scaleFactor")!=null && request.getParameter("scaleFactor")!="")
					scaleFactor = request.getParameter("scaleFactor");
				
				if(request.getParameter("isFitOnLoad")!=null && request.getParameter("isFitOnLoad")!="")
					isFitOnLoad = Boolean.parseBoolean(request.getParameter("isFitOnLoad"));
				
				if(request.getParameter("pip")!=null && request.getParameter("pip")!="")
					allowPrint = Boolean.parseBoolean(request.getParameter("pip"));
				
				if(request.getParameter("dip")!=null && request.getParameter("dip")!="")
					allowDownload = Boolean.parseBoolean(request.getParameter("dip"));
				
				if(request.getParameter("libUdvSearchQuery") !=null && request.getParameter("libUdvSearchQuery")!="")
					libUdvSearchQuery = request.getParameter("libUdvSearchQuery");
				
				if(request.getParameter("isJPLT") !=null && request.getParameter("isJPLT")!="")
					isJPLT = Boolean.parseBoolean(request.getParameter("isJPLT"));
				
				if(request.getParameter("imagePath") !=null && request.getParameter("imagePath")!="")
					imagePath = request.getParameter("imagePath");
				
				JSONArray patternList = UDVConstants.getPatternList();
				String patternPath = UDVConstants.getPatternPath();
				if(isOverride)
				{
					if(request.getParameter("searchPatternPath")!=null)
					{
						patternPath = request.getParameter("searchPatternPath");
						if(!patternPath.isEmpty())
							patternList = UDVJSONUtil.retrievePatternNameAndIndex(patternPath);
					}
					if(request.getParameter("allowRotation")!=null ) 
						allowRotation = Boolean.valueOf((String) request.getParameter("allowRotation"));
					
					if(request.getParameter("rotationMarkupPath")!=null)
						rotationMarkupPath = (String) request.getParameter("rotationMarkupPath");
					
					if(request.getParameter("annotateTab")!=null)
						showAnnotateTab = Boolean.parseBoolean(((String) request.getParameter("annotateTab")));
					
					if(request.getParameter("redactTab")!=null)
						showRedactTab = Boolean.parseBoolean(((String) request.getParameter("redactTab")));
					
					if(request.getParameter("autoGeneration")!=null)
						autoGeneration = Boolean.parseBoolean(request.getParameter("autoGeneration"));
					
					if(request.getParameter("excludeRotation")!=null)
						excludeRotation = Boolean.parseBoolean(request.getParameter("excludeRotation"));
					if(request.getParameter("highlightColor")!=null)
						highlightColor = request.getParameter("highlightColor");
					
					if(request.getParameter("defaultTab")!=null)
						defaultTab = request.getParameter("defaultTab");
							
				}
				

				if(markupPath==null)
				{
					File nativePath = new File(document);
					String volumeDir = nativePath.getParentFile().getName();
					String rootDirectory = nativePath.getParentFile().getParentFile().getParentFile()+"/markup";
					File root = new File(rootDirectory);
					root.mkdir();
					File markupFile = new File(rootDirectory+"/"+volumeDir+"/1/Sample_markup.xml");
					markupFile.getParentFile().mkdirs();
					markupFile.createNewFile();
					markupPath = markupFile.getAbsolutePath();
				}
				markupPath = markupPath.replace("\\", "/");
				List<String> reasonList = Arrays.asList(redactionReason.split(","));
				
				JSONObject configuration = new JSONObject();
				JSONArray jsonArray = new JSONArray();
				for(String str : reasonList)
				{
					jsonArray.add(str);
				}
				
				try {
					configuration.put("docViewerVersion", docViewerVersion);
					configuration.put("redactionReason", jsonArray);
					configuration.put("stampData", stampData);
					configuration.put("doc", request.getParameter("doc"));
					configuration.put("markupPath", markupPath);
					configuration.put("domain", UDVConstants.getDomain());
					configuration.put("allowRotation", allowRotation);
					configuration.put("rotationMarkupPath", rotationMarkupPath);
					configuration.put("excludeRotation", excludeRotation);
					configuration.put("autoGeneration", autoGeneration);
					configuration.put("redactTab", showRedactTab);
					configuration.put("redactPattern", showRedactPattern);
					configuration.put("annotateTab", showAnnotateTab);
					configuration.put("isMobile", isMobile);
					configuration.put("highlightColor", highlightColor);
					configuration.put("fitOnLoad", isFitOnLoad);
					configuration.put("defaultTab", defaultTab);
					configuration.put("allowPrint", allowPrint);
					configuration.put("allowDownload", allowDownload);
					configuration.put("scaleFactor", scaleFactor);
					configuration.put("isJPLT", isJPLT);
					configuration.put("imagePath", imagePath);
					if(libUdvSearchQuery.contains("\"")){
						libUdvSearchQuery = libUdvSearchQuery.replace("\"", "qxzzxq");
					}
					configuration.put("libUdvSearchQuery", libUdvSearchQuery);
					if(patternList.size()>0)
						configuration.put("patternList", patternList);
					if(patternPath!=null && !patternPath.isEmpty())
						configuration.put("patternPath",patternPath);
					
					if(!userId.isEmpty())
						configuration.put("userId", userId);
					configuration.put("annotation",UDVConstants.ANNOTATION_CONFIGURATION);

					if(timezone!=null && !timezone.isEmpty())
						configuration.put("timezone", timezone);
					
					//configuration.put("printTemplate", udvPrintTemplateStr);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

				request.setAttribute("config", configuration);
				request.setAttribute("printTemplate", udvPrintTemplateStr);
				//Processing for redaction reasons
				RequestDispatcher rd = getServletContext().getRequestDispatcher("/index.jsp");
		        rd.forward(request, response);
		        log.info("Request processed successfully! "+client);
			}
			else
			{
				System.out.println(request.getRemoteHost() +" attempted to access but denied");
				HttpServletResponse alteredResponse = ((HttpServletResponse) response);
				alteredResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
				alteredResponse.setContentType("text/plain");
				alteredResponse.getWriter().println("ACCESS DENIED");
			}

		}
		catch(Exception e)
		{
			e.printStackTrace();
		}

	}
	
	public void loadConfiguration()
	{
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		for(Object obj : request.getParameterMap().entrySet())
		{
			Entry<String, String[]> ent = (Entry<String, String[]>) obj;
			log.info(ent.getKey() + " = "+ ent.getValue()[0]);
			System.out.println(ent.getKey() + " = "+ ent.getValue()[0]);
		}
	}
	
    public String getFileContent(String filePath) {
		File file = new File (filePath);
		StringBuilder sb = new StringBuilder();
		try {
		    BufferedReader br = new BufferedReader(new FileReader(file));
		    String line;
		    while ((line = br.readLine()) != null) {
				sb.append(line);
		    }
		} catch(IOException ex) {
		    sb.setLength(0);
		    sb.append(ex.getMessage());
		}
		return sb.toString();
    }
    
	public static JSONArray readPatternJSONFile(String filePath)
	{
		JSONArray patternList = null;
		try
		{
			JSONParser parser = new JSONParser();
			patternList = (JSONArray) parser.parse(new FileReader(filePath));
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
		return patternList;
	}

}
