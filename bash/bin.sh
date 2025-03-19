#!/bin/bash

bin(){
   mkdir -p SSLcredential;
   cd SSLcredential;
   FQDN="foo.threeProject.org";
   ORGNAME="Example University";
   ALTNAMES="DNS:$FQDN"
   echo "[ req ]" >> openssl.cnf
   echo "default_bits = 2048" >> openssl.cnf  
   echo "default_md = sha256" >> openssl.cnf
   echo "prompt = no" >> openssl.cnf
   echo "encrypt_key = no" >> openssl.cnf
   echo "distinguished_name = dn" >> openssl.cnf
   echo "req_extensions = req_ext" >> openssl.cnf
   echo "[ dn ]" >> openssl.cnf
   echo "C = CH" >> openssl.cnf
   echo "O = $ORGNAME" >> openssl.cnf
   echo "CN = $FQDN" >> openssl.cnf
   echo "[ req_ext ]" >> openssl.cnf
   echo "subjectAltName = $ALTNAMES" >> openssl.cnf
   openssl req -x509 -config openssl.cnf -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365;
   openssl rsa -in keytmp.pem -out key.pem;
   rm -f keytmp.pem
   rm -f openssl.cnf
}
bin

