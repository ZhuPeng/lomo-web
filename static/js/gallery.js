$.ajaxSetup({
    headers: {
        "Authorization": "token=" + sessionStorage.getItem("token")
    }
});

function fetchMonthLevelMerkleTree() {
    return $.ajax({
        url: CONFIG.getMonthLevelMerkleTreeUrl(),
        dataType: 'json'
    });
}

function fetchAssetLevelMerkleTree() {
    fetchMonthLevelMerkleTree().then(
        function (monthLevelTree) {
            console.log( "fetchMonthLevelMerkleTree succeed!");
            //console.log(monthLevelTree);

            var arrayOfPromises = [];
            var yearCnt = monthLevelTree.Years.length;
            for (var i = 0; i < yearCnt; ++i) {
                var yearRec = monthLevelTree.Years[i];
                var year = yearRec.Year;
                var monthCnt = yearRec.Months.length;
                for (var j = 0; j < monthCnt; ++j) {
                    var monthRec = yearRec.Months[j];
                    var month = monthRec.Month;
                    console.log('fetching assets for ' + year + '/' + month);
                    arrayOfPromises.push(
                        $.ajax({
                            url: CONFIG.getAssetLevelMerkleTreeUrl(year, month),
                            dataType: 'json'
                        }).then(
                            function (assetLevelTree) {
                                console.log("fetchAsset record succeed!");
                                //console.log(assetLevelTree)
                                var dayCnt = assetLevelTree.Days.length;
                                for (var k = 0; k < dayCnt; ++k) {
                                    var dayRec = assetLevelTree.Days[k];
                                    var assetCnt = dayRec.Assets.length;
                                    for (var m = 0; m < assetCnt; ++m) {
                                        var assetRec = dayRec.Assets[m];
                                        console.log("Name: " + assetRec.Name + ", Hash: " + assetRec.Hash);
                                        elem = '<a href="' + CONFIG.getAssetUrl(assetRec.Name)
                                            + '" title="' + assetRec.Name 
                                            + '" data-type="' + getMimeType(assetRec.Name) +'" data-gallery>'
                                            + '<img class="lazy" data-src="' + CONFIG.getPreviewUrl(assetRec.Name)
                                            + '"/></a>';
                                        $( "#links" ).append(elem);
                                    }
                                }
                            },

                            function( xhr, status, errorThrown ) {
                                alert( "Sorry, there was a problem in fetchMonthLevelMerkleTree!" );
                                console.log( "Error: " + errorThrown );
                                console.log( "Status: " + status );
                                console.dir( xhr );
                            }
                        )
                    );
                }
            }
       
            var i = 0;

            $.when.apply($, arrayOfPromises).then(function() {
                console.log("all done!");
                $('.lazy').lazy();
            });
        },

        function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem in fetchMonthLevelMerkleTree!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        }
    )
}

function getMimeType(filename) {
    var ext = filename.split('.').pop().toLowerCase();

    var extToMimes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'heif': 'image/heif',
        'heic': 'image/heic',
        '3gp': 'video/3gpp',
        '3g2': 'video/3gpp2',
        'mov': 'video/mp4',
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mpg': 'video/mpeg',
        'mpeg': 'video/mpeg',
        'webm': 'video/webm',
    }

    if (extToMimes.hasOwnProperty(ext)) {
        return extToMimes[ext];
    }
    return '';
}

$(function() {
    if (sessionStorage.getItem("token") === null) {
        document.location.href = '/';
    }

    $('a#logout').text("Logout " + sessionStorage.getItem("username"))
    $('a#logout').click(function() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userid");
    sessionStorage.removeItem("username");
    document.location.href = '/';
    });

    fetchAssetLevelMerkleTree();
});