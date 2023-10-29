// Add-on updated related options

// Browser security related options

// Development time options
// pref("javascript.options.strict", true);
// pref("nglayout.debug.disable_xul_cache", true);
// pref("nglayout.debug.disable_xul_fastload", true);

// Debugging options
// pref("browser.dom.window.dump.enabled", true);
// pref("javascript.options.showInConsole", true);

pref("extensions.avpki.tools.log.enabled", false);
pref("extensions.avpki.tools.log.level", "2");
/*
pref("extensions.avpki.tools.test.enabled", false);
*/
pref("extensions.avpki.usagepage.url", "chrome://keymanager/content/firstrun/keymanagerInfo.html");

pref("extensions.avpki.import.tempcerts.enabled", true);
pref("extensions.avpki.eximcerts.import.tempcerts.enabled", true);
pref("extensions.avpki.eximcerts.overlay.show.buttons", true);
pref("extensions.avpki.eximcerts.overlay.show.export", false);
pref("extensions.avpki.eximcerts.log.enabled", false);
pref("extensions.avpki.eximcerts.log.level", 2);

pref("extensions.avpki.signcerttool.useOldVersion", false);
pref("extensions.avpki.signcerttool.log.enabled", false);
pref("extensions.avpki.signcerttool.log.level", 2);

pref("extensions.avpki.useOldVersion", false);
pref("extensions.avpki.generateCSR.useNewGenKeyCSRDialog", true);
pref("extensions.avpki.generateCSR.pkcs10.view.ca.server.type.default", "pkcs10CA");
pref("extensions.avpki.generateCSR.pkcs10.view.ca.server.url.msCertService", "http://localhost/certsrv/certfnsh.asp");
pref("extensions.avpki.generateCSR.pkcs10.view.ca.server.url.pkcs10CA", "http://localhost:80/caserver/uploadCSRAndSignCertByCA.jsp");
pref("extensions.avpki.genkeycsr.useOldVersion", false);
pref("extensions.avpki.genkeycsr.log.enabled", false);
pref("extensions.avpki.genkeycsr.log.level", 2);

pref("extensions.avpki.certdetail.subjdn.attrNames", "cn, orgUnit, org, locality, state, country, dc");
pref("extensions.avpki.certdetail.subjdn.useDefault", true);
pref("extensions.avpki.certdetail.orgUnit", "");
pref("extensions.avpki.certdetail.org", "Self-Signed");
pref("extensions.avpki.certdetail.locality", "Basking Ridge");
pref("extensions.avpki.certdetail.state", "NJ");
pref("extensions.avpki.certdetail.country", "US");
pref("extensions.avpki.certdetail.keySize", "1024");
pref("extensions.avpki.certdetail.keyType", "rsa");
pref("extensions.avpki.certdetail.sigAlgorithm", "SHA1");
pref("extensions.avpki.certdetail.x509Version3", true);
pref("extensions.avpki.certdetail.autoGenerateSerialNo", true);
pref("extensions.avpki.certdetail.validityAutoGen", true);
pref("extensions.avpki.certdetail.defaultValidityInMonths", "60");

pref("extensions.avpki.scepclient.log.enabled", false);
pref("extensions.avpki.scepclient.log.level", 2);
pref("extensions.avpki.scepclient.test.enabled", false);
pref("extensions.avpki.scepclient.gcitest.enabled", false);
pref("extensions.avpki.scepclient.serverurl.default", "");
pref("extensions.avpki.scepclient.httpmethod.postform", false);
pref("extensions.avpki.scepclient.httpmethod.default", "GET");
pref("extensions.avpki.scepclient.sigalg.default", "SHA1"); // MD5|SHA1|SHA256|SHA384|SHA512
pref("extensions.avpki.scepclient.capabilities.override", false);
pref("extensions.avpki.scepclient.capabilities.value", "GetNextCACert POSTPKIOperation SHA-1 SHA-256");
pref("extensions.avpki.scepclient.avdevprofile.enabled", false);
// Unsupported - yet to be implemented
pref("extensions.avpki.scepclient.server.isra", false);
pref("extensions.avpki.scepclient.cacert.subjectdn.default", "");
pref("extensions.avpki.scepclient.racert.subjectdn.default", "");
pref("extensions.avpki.scepclient.servercert.subject", "");

pref("extensions.avpki.scepclient.enroll.ejbca.enabled", false);
// pref("extensions.avpki.scepclient.enroll.ejbca.log.enabled", false);


pref("extensions.avpki.softtokendbmgr.enabled", false);
// pref("extensions.avpki.softtokendbmgr.dbinfolist", "/tmp/KeyManager/MODUTIL_TEST/CertDB2,NSS Token2,,enabled,true|/tmp/KeyManager/MODUTIL_TEST/CertDB,NSS Token2,,enabled,true");
pref("extensions.avpki.changepw.fips.compatible.details", true);

// pref("extensions.avpki.sshclient.enabled", true);
pref("extensions.avpki.sshclient.shellcmdpath", "/bin/bash");
pref("extensions.avpki.sshclient.terminal", "/usr/bin/xterm");
// pref("extensions.avpki.sshclient.termargs", "-geometry 110x26+100+24");
// pref("extensions.avpki.sshclient.sshcommand", "/home/subrata/Projects/OpenSSH/openssh-5.1p1/ssh");
pref("extensions.avpki.sshclient.sshcommand", "/usr/bin/ssh");


pref("extensions.avpki.crltool.enabled", true);
pref("extensions.avpki.crltool.test.enabled", false);
pref("extensions.avpki.crltool.log.enabled", false);
pref("extensions.avpki.crltool.log.level", 2);
// pref("extensions.avpki.crltool.issuer", "");
// pref("extensions.avpki.crltool.reasoncode", "superseded");
// pref("extensions.avpki.crltool.sigAlgName", "SHA1");
pref("extensions.avpki.crltool.useauthkeyid", true);

pref("extensions.avpki.jksmanagecert.enabled", true);
pref("extensions.avpki.jksmanagecert.test.enabled", false);
pref("extensions.avpki.jksmanagecert.log.enabled", false);
pref("extensions.avpki.jksmanagecert.log.level", 2);
pref("extensions.avpki.jksmanagecert.javaversion", "1.6");
/*
pref("extensions.avpki.jksmanagecert.shellcmdpath", "/bin/bash");
pref("extensions.avpki.jksmanagecert.javahome", "/home/subrata/SharedApps/jdk1.6");
pref("extensions.avpki.jksmanagecert.genkeyoption", "-genkeypair");
*/
/*
pref("extensions.avpki.jksmanagecert.shellcmdpath", "/usr/bin/perl");
pref("extensions.avpki.jksmanagecert.shellcmdpath.perl", "/usr/bin/perl");
pref("extensions.avpki.jksmanagecert.shellcmdpath.shell", "/bin/bash");
pref("extensions.avpki.jksmanagecert.shellcmd.type", "perl");
*/

/* GUI and processing of following perferences are not yet implemented. */

pref("extensions.avpki.xpsigntool.log.enabled", false);
pref("extensions.avpki.xpsigntool.log.level", 2);
pref("extensions.avpki.xpsigntool.sign.signerCert", "");
pref("extensions.avpki.xpsigntool.sign.addSigningTime", false);
pref("extensions.avpki.xpsigntool.sign.optimizeArchive", false);
pref("extensions.avpki.xpsigntool.sign.saveArchive", false);
pref("extensions.avpki.xpsigntool.sign.compressionLevel", -1);
pref("extensions.avpki.xpsigntool.sign.useSignerAliasAsBaseName", true);
pref("extensions.avpki.xpsigntool.updatemanifest.signerCert", "");
pref("extensions.avpki.xpsigntool.updatemanifest.backup", true);
pref("extensions.avpki.xpsigntool.test.enabled", false);

pref("extensions.avpki.attrcerttool.log.enabled", false);
pref("extensions.avpki.attrcerttool.log.level", 2);
pref("extensions.avpki.attrcerttool.sign.baseProfile", "");
pref("extensions.avpki.attrcerttool.sign.holderCert", "");
pref("extensions.avpki.attrcerttool.sign.issuerCert", "");
pref("extensions.avpki.attrcerttool.sign.serialNoAutoGen", true);
pref("extensions.avpki.attrcerttool.sign.validityAutoGen", true);
pref("extensions.avpki.attrcerttool.sign.sigAlgorithm", "SHA1");
pref("extensions.avpki.attrcerttool.test.enabled", false);

pref("extensions.avpki.mailacctcert.baseProfileType", "basicconstraints");

