#!/bin/bash

# declare Associative arrays (like hashmaps): http://wiki.bash-hackers.org/syntax/arrays
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

rm -rf by-province
mkdir by-province

echo -e '## Processing all provinces...'
for i in A B C D E F G H J K L M N P Q R S T U V W X Y Z; do
  text="{\"iso_31662\":\"AR-${i}\",\"provincia\":\"${PROVINCES[${i}]}\",\"localidades\":"
  text="${text}`curl -s 'https://www.correoargentino.com.ar/sites/all/modules/custom/ca_forms/api/wsFacade.php' \
  --data-raw "action=localidades&localidad=none&calle=&altura=&provincia=${i}"`}"

  echo '## Saving current province localities...'
  # tr command needed to delete invisible character on curl
  # http://alvinalexander.com/blog/post/linux-unix/how-remove-non-printable-ascii-characters-file-unix
  text=$(echo ${text} | tr -cd '\11\12\15\40-\176')
  CURRENT_FILE=$(echo -e "by-province/${PROVINCES[${i}]}.json" | tr -d '[:space:]')
  # --compact-output: json minified
  echo ${text} | jq --compact-output '.' | cat > ${CURRENT_FILE}
  echo '## [DONE]'
done
