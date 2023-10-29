
pref("extensions.avpki.certenroll.enabled", true);
pref("extensions.avpki.certenroll.test.enabled", false);
/*
pref("extensions.avpki.certenroll.cert.test.password", "abcd1234");
*/

pref("extensions.avpki.certenroll.cert.baseProfileType", "sig_dataencipherment");
// pref("extensions.avpki.certenroll.cert.orgUnit", "Avaya Labs");
pref("extensions.avpki.certenroll.cert.org", "Avaya");
pref("extensions.avpki.certenroll.cert.locality", "Baskin Ridge");
pref("extensions.avpki.certenroll.cert.state", "NJ");
pref("extensions.avpki.certenroll.cert.country", "US");
pref("extensions.avpki.certenroll.cert.keySize", "2048");
pref("extensions.avpki.certenroll.cert.keyType", "rsa");

pref("extensions.avpki.certenroll.ca.server.type", "pkcs10CA"); // scep | simpleCA | pkcs10CA | msCertService | openCA | ejbCA

/*
pref("extensions.avpki.certenroll.ca.server.simpleCA.enrollURL", "http://gemstar.usae.avaya.com:8080/songjie/signCSR/uploadANDsign.jsp");
pref("extensions.avpki.certenroll.ca.server.simpleCA.subject", "CN=DelgAlrSubCA,OU=ResearchCA,O=Avayalabs,C=US");
pref("extensions.avpki.certenroll.ca.server.simpleCA.login", false);
pref("extensions.avpki.certenroll.ca.server.simpleCA.XloginURL", "http://gemstar.usae.avaya.com:8080/songjie/login/");
pref("extensions.avpki.certenroll.ca.server.simpleCA.dnldCertChainURL", "http://gemstar.usae.avaya.com:8080/songjie/signCSR/getCACertChain.jsp");
pref("extensions.avpki.certenroll.ca.server.simpleCA.dnldSignedCertURL", "http://gemstar.usae.avaya.com:8080/songjie/signCSR/getCACertChain.jsp");

pref("extensions.avpki.certenroll.ca.server.pkcs10CA.enrollURL", "http://localhost:18080/prodsignedcertdemo/pki/pkcs10/uploadCSRAndSignCertByCA.jsp");
pref("extensions.avpki.certenroll.ca.server.pkcs10CA.subject", "CN=DelgAlrSubCA,OU=ResearchCA,O=Avayalabs,C=US");
pref("extensions.avpki.certenroll.ca.server.pkcs10CA.login", true);
pref("extensions.avpki.certenroll.ca.server.pkcs10CA.loginURL", "http://localhost:18080/prodsignedcertdemo/login/");
pref("extensions.avpki.certenroll.ca.server.pkcs10CA.dnldCertChainURL", "http://localhost:18080/prodsignedcertdemo/pki/pkcs10/getCACertChain.jsp");
pref("extensions.avpki.certenroll.ca.server.pkcs10CA.dnldSignedCertURL", "http://localhost:18080/prodsignedcertdemo/pki/pkcs10/getCACertChain.jsp");

pref("extensions.avpki.certenroll.ca.server.msCertService.enrollURL", "http://135.9.71.17/certsrv/certfnsh.asp");
pref("extensions.avpki.certenroll.ca.server.msCertService.subject", "CN=DMCCDev2,DC=aes,DC=rnd,DC=avaya,DC=com");
pref("extensions.avpki.certenroll.ca.server.msCertService.login", true);
pref("extensions.avpki.certenroll.ca.server.msCertService.loginURL", "http://135.9.71.17/certsrv/certrqxt.asp");
pref("extensions.avpki.certenroll.ca.server.msCertService.dnldCertChainURL", "http://135.9.71.17/certsrv/certcarc.asp");
pref("extensions.avpki.certenroll.ca.server.msCertService.dnldSignedCertURL", "http://135.9.71.17/certsrv/certckpn.asp");
*/

