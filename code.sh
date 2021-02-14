#!/bin/bash

declare -A PROVINCES
PROVINCES['A']='Salta'
PROVINCES['B']='Buenos Aires'
PROVINCES['C']='Ciudad Aut\u00F3noma de Buenos Aires'
PROVINCES['D']='San Luis'
PROVINCES['E']='Entre R\u00EDos'
PROVINCES['F']='La Rioja'
PROVINCES['G']='Santiago del Estero'
PROVINCES['H']='Chaco'
PROVINCES['J']='San Juan'
PROVINCES['K']='Catamarca'
PROVINCES['L']='La Pampa'
PROVINCES['M']='Mendoza'
PROVINCES['N']='Misiones'
PROVINCES['P']='Formosa'
PROVINCES['Q']='Neuqu\u00E9n'
PROVINCES['R']='R\u00EDo Negro'
PROVINCES['S']='Santa Fe'
PROVINCES['T']='Tucum\u00E1n'
PROVINCES['U']='Chubut'
PROVINCES['V']='Tierra del Fuego, Ant\u00E1rtida e Islas del Atl\u00E1ntico Sur'
PROVINCES['W']='Corrientes'
PROVINCES['X']='C\u00F3rdoba'
PROVINCES['Y']='Jujuy'
PROVINCES['Z']='Santa Cruz'

rm -f by-province
mkdir by-province

echo -e "### Processing all provinces..."

for i in A B C D E F G H J K L M N P Q R S T U V W X Y Z; do
  echo -e "### Processing province ${PROVINCES[${i}]}"
  text="{\"iso_31662\":\"AR-${i}\",\"province\":\"${PROVINCES[${i}]}\",\"localities\":"
  text="${text}`curl -s 'https://www.correoargentino.com.ar/sites/all/modules/custom/ca_forms/api/wsFacade.php' \
  -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:85.0) Gecko/20100101 Firefox/85.0' \
  -H 'Accept: application/json, text/javascript, */*; q=0.01' \
  -H 'Accept-Language: en-US,en;q=0.5' --compressed \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -H 'Origin: https://www.correoargentino.com.ar' \
  -H 'DNT: 1' \
  -H 'Connection: keep-alive' \
  -H 'Referer: https://www.correoargentino.com.ar/formularios/cpa' \
  -H 'Cookie: BIGipServerPL_PROD_WWW=3356098826.47873.0000; has_js=1; popup_message_displayed=1612658599580' \
  --data-raw "action=localidades&localidad=none&calle=&altura=&provincia=${i}"`}"
  
  echo '### Saving current province localities...'
  text=$(echo ${text} | tr -cd '\11\12\15\40-\176')
  CURRENT_FILE=$(echo -e "by-province/${PROVINCES[${i}]}.json" | tr -d '[:space:]')
  echo ${text} | jq --compact-output '.' | cat > ${CURRENT_FILE}
  echo '### [DONE]'
 done

echo '### [COMPLETE]'