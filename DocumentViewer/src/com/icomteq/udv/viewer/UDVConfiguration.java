package com.icomteq.udv.viewer;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class UDVConfiguration {

	private static String markupFolderPath;
	private static String documentPath;
	private static String webUpLoadSourceFile = "";
	private static String webServiceUrl = "";
	
	public static void loadConfig(URL configurationUrl) throws IOException {
		Document doc;
		try {
			doc = loadConfigDocument(configurationUrl);
		} catch (ParserConfigurationException e) {
			throw new RuntimeException(e);
		} catch (SAXException e) {
			throw new RuntimeException(e);
		}

		NodeList nodes = doc.getElementsByTagName("context-param");
		String webServiceScheme = null;
		String webServiceHost = null;
		String webServicePort = null;
		String webServicePath = null;
		for (int i = 0; i < nodes.getLength(); i++) {
			Node node = nodes.item(i);
			if (node.getNodeType() == Node.ELEMENT_NODE) {
				String paramName = getValue((Element) node, "param-name");
				String paramValue = getValue((Element) node, "param-value");
				if ("MarkupsPath".equals(paramName)) {
					markupFolderPath = paramValue;
				} else if ("WebServiceScheme".equals(paramName)) {
					webServiceScheme = paramValue;
				} else if ("WebServiceHost".equals(paramName)) {
					webServiceHost = paramValue;
				} else if ("WebServicePort".equals(paramName)) {
					webServicePort = paramValue;
				} else if ("WebServicePath".equals(paramName)) {
					webServicePath = paramValue;
				} else if ("WebUpLoadSourceFile".equals(paramName)) {
					webUpLoadSourceFile = paramValue;
				}
			}
		}

		if (isNullOrEmpty(documentPath)) {
			documentPath = "./";
		}
		if (documentPath.startsWith("./") || documentPath.startsWith(".\\")) {
			documentPath = new File(documentPath).getCanonicalPath();
		}
		if (isNullOrEmpty(webServiceHost)) {
			webServiceHost = "localhost";
		}
		if (isNullOrEmpty(webServicePort)) {
			webServicePort = "18680";
		}
		if (isNullOrEmpty(webServicePath)) {
			webServicePort = "PCCIS/V1";
		}
		if (isNullOrEmpty(webServiceScheme)) {
			webServiceScheme = "http";
		}
		if (isNullOrEmpty(webUpLoadSourceFile)) {
			webUpLoadSourceFile = "false";
		}
		if (isNullOrEmpty(markupFolderPath)) {
			markupFolderPath = new File(new File(
					System.getProperty("java.io.tmpdir")), "Markups")
					.getCanonicalPath();
		}

		documentPath = fixPath(inlineEnvVariables(documentPath));
		markupFolderPath = fixPath(inlineEnvVariables(markupFolderPath));
		webServiceUrl = webServiceScheme + "://" + webServiceHost + ":"
				+ webServicePort + "/" + webServicePath;
	}

	private static String fixPath(String path) {
		if (path == null) {
			return "";
		}
		String result = path.replace('\\', '/');
		if (!documentPath.endsWith("/")) {
			result += "/";
		}
		return result;
	}
	
	private static Document loadConfigDocument(URL configurationUrl)
			throws ParserConfigurationException, IOException, SAXException {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();
		return builder.parse(configurationUrl.toExternalForm());
	}
	
    private static String getValue(Element elem, String tag) {
        NodeList nodes = elem.getElementsByTagName(tag).item(0).getChildNodes();
        Node node = (Node) nodes.item(0);
        return node.getNodeValue();
    }
    
    private static boolean isNullOrEmpty(String value) {
        return value == null || value.length() == 0;
    }
    
    protected static String inlineEnvVariables(String str) {
        Pattern pattern = Pattern.compile("\\%([A-Za-z]*)\\%");
        String ret = str;

        Matcher mm = pattern.matcher(str);
        while (mm.find()) {
            String varName = mm.group(1);
            try {
                String varValue = System.getenv(varName);
                if (varValue != null) {
                    ret = ret.substring(0, mm.start(1) - 1) + varValue + ret.substring(mm.end(1) + 1);
                }
            } catch (SecurityException e) {
                // skipping
            }
        }
        return ret;
    }
}
