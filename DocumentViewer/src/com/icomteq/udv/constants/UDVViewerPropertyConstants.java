package com.icomteq.udv.constants;

import java.util.HashSet;
import java.util.Set;

/**
 * Class handling all valid values for annotation properties
 * @author jcyau
 *
 */
public class UDVViewerPropertyConstants {

	private static final Set<String> FONT_SIZE_SET = new HashSet<String>();  
	private static final Set<String> FONT_FACE_SET = new HashSet<String>(); 
	private static final Set<String> TAB_SET = new HashSet<String>();
	static
	{
		//Font size values initialization
		FONT_SIZE_SET.add("8");
		FONT_SIZE_SET.add("9");
		FONT_SIZE_SET.add("10");
		FONT_SIZE_SET.add("11");
		FONT_SIZE_SET.add("12");
		FONT_SIZE_SET.add("14");
		FONT_SIZE_SET.add("16");
		FONT_SIZE_SET.add("18");
		FONT_SIZE_SET.add("20");
		FONT_SIZE_SET.add("22");
		FONT_SIZE_SET.add("24");
		FONT_SIZE_SET.add("26");
		FONT_SIZE_SET.add("28");
		FONT_SIZE_SET.add("30");
		FONT_SIZE_SET.add("36");
		FONT_SIZE_SET.add("48");
		FONT_SIZE_SET.add("72");
		
		//Font face/style initialization
		FONT_FACE_SET.add("Arial");
		FONT_FACE_SET.add("Calibri");
		FONT_FACE_SET.add("Comic Sans MS");
		FONT_FACE_SET.add("Courier");
		FONT_FACE_SET.add("Georgia");
		FONT_FACE_SET.add("Tahoma");
		FONT_FACE_SET.add("Times New Roman");
		FONT_FACE_SET.add("Verdana");
		
		TAB_SET.add("page");
		TAB_SET.add("annotate");
		TAB_SET.add("redact");
		TAB_SET.add("search");
		TAB_SET.add("collab");
		
	}
	
	
	public static Boolean isValidFontSize(String fontSize)
	{
		return FONT_SIZE_SET.contains(fontSize);
	}
	
	public static Boolean isValidTab(String tab)
	{
		return TAB_SET.contains(tab);
	}
	
	public static Boolean isValidFontFace(String fontFace)
	{
		return FONT_FACE_SET.contains(fontFace);
	}
	
	public static Boolean isValidColor(){
	    return false;
	}
	
	public static Boolean isValidBorderWidth(){
	    return false;
	}
	
	
	
}
