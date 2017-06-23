package CrypterV2;

import java.security.Key;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;

public class Crypter {

    protected String CLASS = getClass().getName();
    private String secretKey = "0A8g65a32t12h45a78B01u3g5a7r9i1n";
    private Key key = new SecretKeySpec(secretKey.getBytes(), "AES");

    public String encrypt(String str) {

	try {

	    Cipher cipher = Cipher.getInstance("AES");
	    cipher.init(Cipher.ENCRYPT_MODE, key);
	    byte[] encrypted = cipher.doFinal(str.getBytes());

	    String encryptedValue = Base64.encodeBase64URLSafeString(encrypted);

	    return encryptedValue;

	} catch (Exception e) {
	    System.out.println("Exception: " + e);
	}
	return null;
    }

    public String decrypt(String str) {

	try {
	    Cipher cipher = Cipher.getInstance("AES");
	    cipher.init(Cipher.DECRYPT_MODE, key);

	    byte[] decryptedValue = Base64.decodeBase64(str);
	    return new String(cipher.doFinal(decryptedValue));

	} catch (Exception e) {
	    System.out.println("Exception: " + e);
	}
	return null;
    }

    public static void main(String[] args) {
	String textToEncrypt = "C:/Users/aabugarin/workspace-jbdevstudio5/DocumentViewer_3.1.0.0/sampleDocs/markup/vol001/1/249_msg.pdf";
	String textToDecrypt = "EZClJId-8Pf5EKM7SjbE9coFkChHgDAPACJJIKSqwm1ZN7Du-E4lmtW0ithgfOV6N8sqc5toxj-_tGv4abMiCdyCIhCBMbiTunGJNCMlNVLnpt0eSwZOm5siN0IZc8cvvM6Jb7RXLd9WkR9B2BJGyg";
	
	
	Crypter c = new Crypter();
	System.out.println();
	System.out.println("ENCRYPTED RESULT: " + c.encrypt(textToEncrypt));
	System.out.println();
	System.out.println("DECRYPTTED RESULTY: " + c.decrypt(textToDecrypt));

    }

}
