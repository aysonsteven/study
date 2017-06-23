package com.icomteq.udv.config;

import java.awt.Color;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Enumeration;
import java.util.PropertyResourceBundle;
import java.util.ResourceBundle;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.json.JSONObject;

import com.icomteq.udv.constants.UDVViewerPropertyConstants;
import com.icomteq.udv.util.UDVColorUtility;

import lombok.extern.log4j.Log4j;

@Log4j
public class UDVConfigInitializer implements ServletContextListener {
    private static ServletContext CONTEXT;

    public void contextInitialized(ServletContextEvent paramServletContextEvent) {
		if (CONTEXT == null) {
		    CONTEXT = paramServletContextEvent.getServletContext();
		}
		
		String prop = CONTEXT.getInitParameter("ConfigurationFile");
		ResourceBundle bundle = ResourceBundle.getBundle(prop);
		
		iterateSetBundleContent(bundle);
		bundle = setNewConfigProperties();
		if (bundle != null) {
			iterateSetBundleContent(bundle);
		}
		
		UDVConstants.setContext(CONTEXT);
    }

    public void contextDestroyed(ServletContextEvent paramServletContextEvent) {
		try {
		    
		} catch(Exception e) {
		    
		}
    }

    private void iterateSetBundleContent(ResourceBundle bundle) {
		Enumeration<String> enum$ = bundle.getKeys();
		
		while (enum$.hasMoreElements()) {
		    String key = (String) enum$.nextElement();
		    String value = bundle.getString(key);
			if(key.contains("annotation."))
			{
				String originalValue = bundle.getString(key);
				value = bundle.getString(key);
				try
				{
					String[] keyValues = key.split("\\.");
					
					String annotationType = keyValues[1];
					JSONObject type = null;

					String property = keyValues[2];
					// If value is empty, set it to null
					if(value==null || value!=null && value.isEmpty())
					{
						value = null;
					}
					else
					{
						//Verify already existing object for annotation type
						if(UDVConstants.ANNOTATION_CONFIGURATION.has(annotationType))
						{
							type = UDVConstants.ANNOTATION_CONFIGURATION.getJSONObject(annotationType);
						}
						else
						{
							// else create
							type = new JSONObject();
						}
						
						
						if(property.contains("Color"))
						{  
						    //handling for color if it is hex value
						    if(UDVColorUtility.isHexColor(value)){
							Color convertedRGB = UDVColorUtility.hex2Rgb(value);
							value = "rgb(" + convertedRGB.getRed() + "," + convertedRGB.getGreen() + "," + convertedRGB.getBlue() + ")";
						    }
						    if(!UDVColorUtility.isValidColor(value)){
							value = null;
						    }
						}
						else if(property.equalsIgnoreCase("fontSize"))
						{
							//verify if valid font size value
							if(!UDVViewerPropertyConstants.isValidFontSize(value))
							{
								value = null;
							}
						}
						else if(property.equalsIgnoreCase("fontFamily"))
						{
							//verify if valid font family value
							if(!UDVViewerPropertyConstants.isValidFontFace(value))
							{
								value = null;							
							}
						}
						else if(isFontStyleProperty(property))
						{
							if(!(value.equalsIgnoreCase("true") || value.equalsIgnoreCase("false")))
								value = null;
						} else if (property.equalsIgnoreCase("borderWeight")){
						    if(!value.matches("[1-8]")){
							value = null;
						    }
						} else if (property.equalsIgnoreCase("opacity")) {
						    if (!value.matches("[1-9]?[0]%") &&  !value.equalsIgnoreCase("100%")){
							value = null;
						    }
						}
					}

					
					if(value!=null)
					{
						if(isFontStyleProperty(property))
						{
							type.put(property, Boolean.parseBoolean(value));
						}
						else
						{
							type.put(property, value);							
						}

						UDVConstants.ANNOTATION_CONFIGURATION.put(annotationType, type);						
					}
					else
					{
						log.error("INVALID PROPERTY VALUE FOR "+property+" USING VALUE "+originalValue);
					}
					
				}
				catch(Exception e)
				{
					e.printStackTrace();
				}
			}
		    CONTEXT.setAttribute(key, value);
		}
		
    }
    
    private Boolean isFontStyleProperty(String property)
    {
    	return property.equalsIgnoreCase("boldStyle") || property.equalsIgnoreCase("strikeStyle") || property.equalsIgnoreCase("underlineStyle") || property.equalsIgnoreCase("italicStyle");
    }
    
	private PropertyResourceBundle setNewConfigProperties() {
		FileInputStream fis = null;
		
		try {
			String fileSet = CONTEXT.getAttribute("server.config.loc").toString()+ CONTEXT.getAttribute("server.config.file").toString();
			fis = new FileInputStream(fileSet);
			return new PropertyResourceBundle(fis);
		} catch (FileNotFoundException e) {
			System.out.println("IOException e :: " +e.getMessage());
		} catch (IOException e) {
			System.out.println("IOException e :: " +e.getMessage());
		} finally {
			if (fis!=null)
				try {
					fis.close();
				} catch (IOException e) {
					System.out.println("IOException e :: " +e.getMessage());
				}
		}
		return null;
	}
}
