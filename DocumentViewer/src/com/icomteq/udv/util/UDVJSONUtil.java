package com.icomteq.udv.util;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.json.simple.JSONArray;

public class UDVJSONUtil {

	public static JSONArray retrievePatternNameAndIndex(String patternPropertyFilePath)
	{
		JSONArray patternIndex = new JSONArray();
		Properties properties = new Properties();
		try {
		  properties.load(new FileInputStream(patternPropertyFilePath));
		  for(Object o : properties.keySet())
		  {
			  patternIndex.add(o);
		  }
		} catch (IOException e) {
		  e.printStackTrace();
		}
		properties.clear();
		properties = null;
		return patternIndex;
	}
	
	public static JSONArray retrievePatternNameAndIndex(InputStream patternPropertyFilePath)
	{
		JSONArray patternIndex = new JSONArray();
		Properties properties = new Properties();
		try {
		  properties.load(patternPropertyFilePath);
		  for(Object o : properties.keySet())
		  {
			  patternIndex.add(o);
		  }
		} catch (IOException e) {
		  e.printStackTrace();
		}
		properties.clear();
		properties = null;
		return patternIndex;
	}
}
