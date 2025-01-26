#DIRS ===============================================================================================================
if [ ! -d src/_outputs ]
  then :
    mkdir src/_outputs
fi
if [ ! -d src/_outputs/csv ]
  then :
    mkdir src/_outputs/csv
fi
if [ ! -d src/_outputs/json ]
  then :
    mkdir src/_outputs/json
fi
if [ ! -d src/_outputs/csv/checkers ]
  then :
    mkdir src/_outputs/csv/checkers
fi

#GENERAL ===============================================================================================================
if [ ! -s src/_inputs/settings/global.js ]
  then :
    echo "\nCreating global.js config in src/_inputs/settings/"
    cp src/_inputs/settings/global.example.js src/_inputs/settings/global.js
fi

if [ ! -s src/_inputs/csv/proxies.csv ]
  then :
    echo "\nCreating proxies.csv in src/_inputs/csv/"
    touch src/_inputs/csv/proxies.csv && echo "proxy,updateProxyLink" >> src/_inputs/csv/proxies.csv
fi

if [ ! -s src/_outputs/csv/checkers/balance-checker.csv ]
  then :
    echo "\nCreating balance-checker.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/balance-checker.csv && echo "id,walletAddress,amount,currency,network" >> src/_outputs/csv/checkers/balance-checker.csv
fi

#POLYHEDRA ===============================================================================================================
if [ ! -s src/_inputs/csv/polyhedra-wallets.csv ]
  then :
    echo "\nCreating polyhedra-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/polyhedra-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/polyhedra-wallets.csv
fi
if [ ! -s src/_outputs/json/polyhedra-wallets.json ]
  then :
    echo "\nCreating polyhedra-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/polyhedra-wallets.json && echo "[]" >> src/_outputs/json/polyhedra-wallets.json
fi

if [ ! -s src/_outputs/csv/polyhedra-failed-wallets.csv ]
  then :
    echo "\nCreating polyhedra-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/polyhedra-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/polyhedra-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/polyhedra-saved-modules.json ]
  then :
    echo "\nCreating polyhedra-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/polyhedra-saved-modules.json && echo "[]" >> src/_outputs/json/polyhedra-saved-modules.json
fi

if [ ! -s src/_outputs/csv/checkers/polyhedra-claim.csv ]
  then :
    echo "\nCreating polyhedra-claim.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/polyhedra-claim.csv && echo "id,walletAddress" >> src/_outputs/csv/checkers/polyhedra-claim.csv
fi

#LAYER_ZERO ===============================================================================================================
if [ ! -s src/_inputs/csv/layer-zero-wallets.csv ]
  then :
    echo "\nCreating layer-zero-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/layer-zero-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/layer-zero-wallets.csv
fi
if [ ! -s src/_outputs/json/layer-zero-wallets.json ]
  then :
    echo "\nCreating layer-zero-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/layer-zero-wallets.json && echo "[]" >> src/_outputs/json/layer-zero-wallets.json
fi

if [ ! -s src/_outputs/csv/layer-zero-failed-wallets.csv ]
  then :
    echo "\nCreating layer-zero-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/layer-zero-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/layer-zero-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/layer-zero-saved-modules.json ]
  then :
    echo "\nCreating layer-zero-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/layer-zero-saved-modules.json && echo "[]" >> src/_outputs/json/layer-zero-saved-modules.json
fi

if [ ! -s src/_outputs/csv/checkers/layer-zero-claim.csv ]
  then :
    echo "\nCreating layer-zero-claim.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/layer-zero-claim.csv && echo "id,walletAddress" >> src/_outputs/csv/checkers/layer-zero-claim.csv
fi

#BLAST ===============================================================================================================
if [ ! -s src/_inputs/csv/blast-wallets.csv ]
  then :
    echo "\nCreating blast-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/blast-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/blast-wallets.csv
fi
if [ ! -s src/_outputs/json/blast-wallets.json ]
  then :
    echo "\nCreating blast-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/blast-wallets.json && echo "[]" >> src/_outputs/json/blast-wallets.json
fi

if [ ! -s src/_outputs/csv/blast-failed-wallets.csv ]
  then :
    echo "\nCreating blast-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/blast-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/blast-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/blast-saved-modules.json ]
  then :
    echo "\nCreating blast-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/blast-saved-modules.json && echo "[]" >> src/_outputs/json/blast-saved-modules.json
fi

if [ ! -s src/_outputs/csv/checkers/blast-claim.csv ]
  then :
    echo "\nCreating blast-claim.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/blast-claim.csv && echo "id,walletAddress" >> src/_outputs/csv/checkers/blast-claim.csv
fi

#TAIKO ===============================================================================================================
if [ ! -s src/_inputs/csv/taiko-wallets.csv ]
  then :
    echo "\nCreating taiko-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/taiko-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/taiko-wallets.csv
fi
if [ ! -s src/_outputs/json/taiko-wallets.json ]
  then :
    echo "\nCreating taiko-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/taiko-wallets.json && echo "[]" >> src/_outputs/json/taiko-wallets.json
fi

if [ ! -s src/_outputs/csv/taiko-failed-wallets.csv ]
  then :
    echo "\nCreating taiko-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/taiko-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/taiko-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/taiko-saved-modules.json ]
  then :
    echo "\nCreating taiko-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/taiko-saved-modules.json && echo "[]" >> src/_outputs/json/taiko-saved-modules.json
fi

if [ ! -s src/_outputs/csv/checkers/taiko-claim.csv ]
  then :
    echo "\nCreating taiko-claim.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/taiko-claim.csv && echo "id,walletAddress" >> src/_outputs/csv/checkers/taiko-claim.csv
fi

#SCROLL ===============================================================================================================
if [ ! -s src/_inputs/csv/scroll-wallets.csv ]
  then :
    echo "\nCreating scroll-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/scroll-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/scroll-wallets.csv
fi
if [ ! -s src/_outputs/json/scroll-wallets.json ]
  then :
    echo "\nCreating scroll-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/scroll-wallets.json && echo "[]" >> src/_outputs/json/scroll-wallets.json
fi

if [ ! -s src/_outputs/csv/scroll-failed-wallets.csv ]
  then :
    echo "\nCreating scroll-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/scroll-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/scroll-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/scroll-saved-modules.json ]
  then :
    echo "\nCreating scroll-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/scroll-saved-modules.json && echo "[]" >> src/_outputs/json/scroll-saved-modules.json
fi

if [ ! -s src/_outputs/csv/checkers/scroll-claim.csv ]
  then :
    echo "\nCreating scroll-claim.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/scroll-claim.csv && echo "id,walletAddress" >> src/_outputs/csv/checkers/scroll-claim.csv
fi

#SUPERFORM ===============================================================================================================
if [ ! -s src/_inputs/csv/superform-wallets.csv ]
  then :
    echo "\nCreating superform-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/superform-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/superform-wallets.csv
fi
if [ ! -s src/_outputs/json/superform-wallets.json ]
  then :
    echo "\nCreating superform-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/superform-wallets.json && echo "[]" >> src/_outputs/json/superform-wallets.json
fi

if [ ! -s src/_outputs/csv/superform-failed-wallets.csv ]
  then :
    echo "\nCreating superform-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/superform-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/superform-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/superform-saved-modules.json ]
  then :
    echo "\nCreating superform-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/superform-saved-modules.json && echo "[]" >> src/_outputs/json/superform-saved-modules.json
fi

if [ ! -s src/_outputs/csv/checkers/superform-superfens-claim-nft.csv ]
  then :
    echo "\nCreating superform-superfens-claim-nft.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/superform-superfens-claim-nft.csv && echo "id,walletAddress" >> src/_outputs/csv/checkers/superform-superfens-claim-nft.csv
fi

#ELIXIR ===============================================================================================================
if [ ! -s src/_inputs/csv/elixir-wallets.csv ]
  then :
    echo "\nCreating elixir-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/elixir-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/elixir-wallets.csv
fi
if [ ! -s src/_outputs/json/elixir-wallets.json ]
  then :
    echo "\nCreating elixir-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/elixir-wallets.json && echo "[]" >> src/_outputs/json/elixir-wallets.json
fi

if [ ! -s src/_outputs/csv/elixir-failed-wallets.csv ]
  then :
    echo "\nCreating elixir-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/elixir-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/elixir-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/elixir-saved-modules.json ]
  then :
    echo "\nCreating elixir-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/elixir-saved-modules.json && echo "[]" >> src/_outputs/json/elixir-saved-modules.json
fi

#SYMBIOTIC ===============================================================================================================
if [ ! -s src/_inputs/csv/symbiotic-wallets.csv ]
  then :
    echo "\nCreating symbiotic-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/symbiotic-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/symbiotic-wallets.csv
fi
if [ ! -s src/_outputs/json/symbiotic-wallets.json ]
  then :
    echo "\nCreating symbiotic-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/symbiotic-wallets.json && echo "[]" >> src/_outputs/json/symbiotic-wallets.json
fi

if [ ! -s src/_outputs/csv/symbiotic-failed-wallets.csv ]
  then :
    echo "\nCreating symbiotic-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/symbiotic-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/symbiotic-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/symbiotic-saved-modules.json ]
  then :
    echo "\nCreating symbiotic-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/symbiotic-saved-modules.json && echo "[]" >> src/_outputs/json/symbiotic-saved-modules.json
fi

if [ ! -s src/_outputs/csv/checkers/symbiotic-points.csv ]
  then :
    echo "\nCreating symbiotic-points.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/symbiotic-points.csv && echo "id,walletAddress" >> src/_outputs/csv/checkers/symbiotic-points.csv
fi

#SWELL ===============================================================================================================
if [ ! -s src/_inputs/csv/swell-wallets.csv ]
  then :
    echo "\nCreating swell-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/swell-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/swell-wallets.csv
fi
if [ ! -s src/_outputs/json/swell-wallets.json ]
  then :
    echo "\nCreating swell-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/swell-wallets.json && echo "[]" >> src/_outputs/json/swell-wallets.json
fi

if [ ! -s src/_outputs/csv/swell-failed-wallets.csv ]
  then :
    echo "\nCreating swell-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/swell-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/swell-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/swell-saved-modules.json ]
  then :
    echo "\nCreating swell-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/swell-saved-modules.json && echo "[]" >> src/_outputs/json/swell-saved-modules.json
fi

if [ ! -s src/_outputs/csv/checkers/swell-claim.csv ]
  then :
    echo "\nCreating swell-claim.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/swell-claim.csv && echo "id,walletAddress" >> src/_outputs/csv/checkers/swell-claim.csv
fi

#ODOS ===============================================================================================================
if [ ! -s src/_inputs/csv/odos-wallets.csv ]
  then :
    echo "\nCreating odos-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/odos-wallets.csv && echo "id,walletAddress,privKey,transferAddress,proxy,updateProxyLink" >> src/_inputs/csv/odos-wallets.csv
fi
if [ ! -s src/_outputs/json/odos-wallets.json ]
  then :
    echo "\nCreating odos-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/odos-wallets.json && echo "[]" >> src/_outputs/json/odos-wallets.json
fi

if [ ! -s src/_outputs/csv/odos-failed-wallets.csv ]
  then :
    echo "\nCreating odos-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/odos-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/odos-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/odos-saved-modules.json ]
  then :
    echo "\nCreating odos-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/odos-saved-modules.json && echo "[]" >> src/_outputs/json/odos-saved-modules.json
fi

if [ ! -s src/_outputs/csv/checkers/odos-claim.csv ]
  then :
    echo "\nCreating odos-claim.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/odos-claim.csv && echo "id,walletAddress" >> src/_outputs/csv/checkers/odos-claim.csv
fi

#SOLAYER ===============================================================================================================
if [ ! -s src/_inputs/csv/solayer-wallets.csv ]
  then :
    echo "\nCreating solayer-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/solayer-wallets.csv && echo "walletAddress" >> src/_inputs/csv/solayer-wallets.csv
fi

if [ ! -s src/_outputs/csv/checkers/solayer-eligibility.csv ]
  then :
    echo "\nCreating solayer-eligibility.csv in src/_outputs/csv/checkers/"
    touch src/_outputs/csv/checkers/solayer-eligibility.csv && echo "walletAddress,allocation" >> src/_outputs/csv/checkers/solayer-eligibility.csv
fi

#DELEGATE ===============================================================================================================
if [ ! -s src/_inputs/csv/delegate-wallets.csv ]
  then :
    echo "\nCreating delegate-wallets.csv in src/_inputs/csv/"
    touch src/_inputs/csv/delegate-wallets.csv && echo "id,walletAddress,privKey,transferAddress,delegateToAddress,proxy,updateProxyLink" >> src/_inputs/csv/delegate-wallets.csv
fi
if [ ! -s src/_outputs/json/delegate-wallets.json ]
  then :
    echo "\nCreating delegate-wallets.json in src/_outputs/json/"
    touch src/_outputs/json/delegate-wallets.json && echo "[]" >> src/_outputs/json/delegate-wallets.json
fi

if [ ! -s src/_outputs/csv/delegate-failed-wallets.csv ]
  then :
    echo "\nCreating delegate-failed-wallets.csv in src/_outputs/csv/"
    touch src/_outputs/csv/delegate-failed-wallets.csv && echo "id,walletAddress,privKey,failReason" >> src/_outputs/csv/delegate-failed-wallets.csv
fi

if [ ! -s src/_outputs/json/delegate-saved-modules.json ]
  then :
    echo "\nCreating delegate-saved-modules.json in src/_outputs/json/"
    touch src/_outputs/json/delegate-saved-modules.json && echo "[]" >> src/_outputs/json/delegate-saved-modules.json
fi

