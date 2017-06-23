package com.icomteq.udv.util;

import java.awt.Color;
import java.util.HashSet;
import java.util.Set;

public class UDVColorUtility {
    
    	private static final Set<Color> COLOR_PALETTE = new HashSet<Color>();
	static
	{
	    //Font size values initialization
	    COLOR_PALETTE.add(new Color(255,0,0));
	    COLOR_PALETTE.add(new Color(255,255,0));
	    COLOR_PALETTE.add(new Color(255,165,0));
	    COLOR_PALETTE.add(new Color(0,255,0));
	    COLOR_PALETTE.add(new Color(0,255,255));
	    COLOR_PALETTE.add(new Color(102,102,255));
	    COLOR_PALETTE.add(new Color(255,0,255));
	    COLOR_PALETTE.add(new Color(238,130,238));
	    COLOR_PALETTE.add(new Color(204,204,204));
	    COLOR_PALETTE.add(new Color(255,255,255));
	    COLOR_PALETTE.add(new Color(128,0,0));
	    COLOR_PALETTE.add(new Color(153,153,0));
	    COLOR_PALETTE.add(new Color(163,98,10));
	    COLOR_PALETTE.add(new Color(0,128,0));
	    COLOR_PALETTE.add(new Color(0,0,255));
	    COLOR_PALETTE.add(new Color(51,51,204));
	    COLOR_PALETTE.add(new Color(146,39,143));
	    COLOR_PALETTE.add(new Color(128,128,128));
	    COLOR_PALETTE.add(new Color(0,0,0));
	}
    
    

	public static Color hex2Rgb(String colorStr) {
	    return new Color(
		    Integer.valueOf( colorStr.substring( 1, 3 ), 16 ),
	            Integer.valueOf( colorStr.substring( 3, 5 ), 16 ),
	            Integer.valueOf( colorStr.substring( 5, 7 ), 16 ) );
	}
	
	public static Boolean isHexColor(String colorString)
	{
	    if(colorString.charAt(0) == '#')
	    {
		return true;
	    }
	    return false;
	}
	
	public static Boolean isRGBColor(String colorString)
	{
	    if(colorString.startsWith("rgb(") && colorString.endsWith(")"))
	    {
		return true;
	    }
	    return false;
	}
	
	public static Color parseColor(String rgbString){
	    String rgbVal = rgbString.substring(rgbString.indexOf("(")+1,rgbString.lastIndexOf(")"));
	    if(!rgbVal.matches("[0-9,]+")){
		return null;
	    }
	    String[] arrSepColors = rgbVal.split(",");
	    if (arrSepColors.length == 3){
		return new Color(
			Integer.parseInt(arrSepColors[0]),
			Integer.parseInt(arrSepColors[1]),
			Integer.parseInt(arrSepColors[2]));
	    } else {
		return null;
	    }
	}
	
	public static Boolean isValidColor(String rgbColorString){
	    Color colorTest;
	    if (isRGBColor(rgbColorString)){
		colorTest = parseColor(rgbColorString);
		return colorTest != null ? COLOR_PALETTE.contains(colorTest) : false;
	    } else
		return false;
	    
	}
	
}
