/*!
 * jquery.instagramFeed
 *
 * @version 1.2.2
 *
 * @author Javier Sanahuja Liebana <bannss1@gmail.com>
 * @contributor csanahuja <csanahuja@gmail.com>
 *
 * https://github.com/jsanahuja/jquery.instagramFeed
 *
 */
(function($){
    var defaults = {
        'host': "https://www.instagram.com/",
        'username': '',
        'tag': '',
        'container': '',
        'display_profile': true,
        'display_biography': true,
        'display_gallery': true,
        'display_igtv': false,
        'get_data': false,
        'callback': null,
        'styling': true,
        'items': 8,
        'items_per_row': 4,
        'margin': 0.5,
        'image_size': 640
    };
    var image_sizes = {
        "150": 0,
        "240": 1,
        "320": 2,
        "480": 3,
        "640": 4
    };
    var escape_map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    function escape_string(str){
        return str.replace(/[&<>"'`=\/]/g, function (char) {
            return escape_map[char];
        });
    }

    $.instagramFeed = function(opts){
        var options = $.fn.extend({}, defaults, opts);
        if(options.username == "" && options.tag == ""){
            console.error("Instagram Feed: Error, no username or tag found.");
            return false;
        }
        if(typeof options.get_raw_json !== "undefined"){
            console.warn("Instagram Feed: get_raw_json is deprecated. See use get_data instead");
            options.get_data = options.get_raw_json;
        }
        if(!options.get_data && options.container == ""){
            console.error("Instagram Feed: Error, no container found.");
            return false;
        }
        if(options.get_data && options.callback == null){
            console.error("Instagram Feed: Error, no callback defined to get the raw json");
            return false;
        }

        var is_tag = options.username == "",
            url = is_tag ? options.host + "explore/tags/"+ options.tag : options.host + options.username;

        $.get(url, function(data){
            data = data.split("window._sharedData = ")[1].split("<\/script>")[0];
            data = JSON.parse(data.substr(0, data.length - 1));
            data = data.entry_data.ProfilePage || data.entry_data.TagPage;
            data = data[0].graphql.user || data[0].graphql.hashtag;
            
            if(options.get_data){
                options.callback(data);
                return;
            }   
                
            //Setting styles
            var styles = {
                'profile_container': "",
                'profile_image': "",
                'profile_name': "",
                'profile_biography': "",
                'gallery_image': ""
            };
            if(options.styling){
                /*styles.profile_container = " style='text-align:center;'";
                styles.profile_image = " style='border-radius:10em;width:15%;max-width:125px;min-width:50px;'";
                styles.profile_name = " style='font-size:1.2em;'";
                styles.profile_biography = " style='font-size:1em;'";
                */
                styles.profile_container = " ";
                styles.profile_image = " ";
                styles.profile_name = " ";
                styles.profile_biography = " ";

                var width = (100 - options.margin * 2 * options.items_per_row)/options.items_per_row;
                //styles.gallery_image = "";
                //styles.gallery_image = " style='margin:"+options.margin+"% "+options.margin+"%;width:"+width+"%;float:left;border: 1px solid #000;'";
                styles.gallery_image = " ";
            }

            var html = "";
            //Displaying profile
            if(options.display_profile){
               // html += "<div class='instagram_profile'" +styles.profile_container +">";
               // html += "<img class='instagram_profile_image' src='"+ data.profile_pic_url +"' alt='"+ (is_tag ? data.name + " tag pic" : data.username + " profile pic") +"'"+ styles.profile_image +" />";
                

                if(is_tag)
                    //html += "<p class='instagram_tag'"+ styles.profile_name +"><a href='https://www.instagram.com/explore/tags/"+ options.tag +"' rel='noopener' target='_blank'>#"+ options.tag +"</a></p>";
                    html += "";
                else
                  //  html += "<p class='instagram_username'"+ styles.profile_name +">@"+ data.full_name +" (<a href='https://www.instagram.com/"+ options.username +"' rel='noopener' target='_blank'>@"+options.username+"</a>)</p>";
        
                if(!is_tag && options.display_biography)
                    html += "";
                    //html += "<p class='instagram_biography'"+ styles.profile_biography +">"+ data.biography +"</p>";
        
                //html += "</div>";

                console.error(data.profile_pic_url);
            }

            //image size
            var image_index = typeof image_sizes[options.image_size] !== "undefined" ? image_sizes[options.image_size] : image_sizes[640];

            if(options.display_gallery){
                if(typeof data.is_private !== "undefined" && data.is_private === true){
                   // html += "<p class='instagram_private'><strong>This profile is private</strong></p>";
                }else{
                    var imgs = (data.edge_owner_to_timeline_media || data.edge_hashtag_to_media).edges;
                        max = (imgs.length > options.items) ? options.items : imgs.length;
                    
                    //html += "<div class='instagram_gallery'>";
                    for(var i = 0; i < max; i++){
                        var url = "https://www.instagram.com/p/" + imgs[i].node.shortcode,
                            image, type_resource, caption;

                        switch(imgs[i].node.__typename){
                            case "GraphSidecar":
                                type_resource = "sidecar"
                                image = imgs[i].node.thumbnail_resources[image_index].src;
                                break;
                            case "GraphVideo":
                                type_resource = "video";
                                image = imgs[i].node.thumbnail_src
                                break;
                            default:
                                type_resource = "image";
                                image = imgs[i].node.thumbnail_resources[image_index].src;
                        }
                        
                        if(typeof imgs[i].node.edge_media_to_caption.edges[0] !== "undefined"){
                            caption = imgs[i].node.edge_media_to_caption.edges[0].node.text;
                        }else if(typeof imgs[i].node.accessibility_caption !== "undefined"){
                            caption = imgs[i].node.accessibility_caption;
                        }else{
                            caption = (is_tag ? data.name : data.username) + " image " + i;
                        }
                        if (escape_string(caption).indexOf("#ferreterito") != -1 ){
                           
                            html += "<div class='col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4'>";
                            html += "<div class='card h-100'>";
                            //html += "<a href='#'><img class='card-img-top' src='http://placehold.it/700x400' alt=''></a>";
                            html += "<img src='" + image + "' alt='" + escape_string(caption) + "'" + " class='card-img-top' />";
                            
                            html += "<div class='card-body'>";
                            html += "<h4 class='card-title text-truncate'   >";
                            html += escape_string(caption);
                            html += "</h4>";
                            html += "<h5>24.00</h5>";

                            html += "<p class='card-text d-inline-block text-truncate' style='max-width: 150px;'>"+ escape_string(caption) +"</p>";
                            html +="<div class='form-group'>";
                            html +="<a href='#' onclick=\"console.log(this)\" data-name='Descripcion' data-price='0.5' class='add-to-cart btn btn-primary'>Agregar al carrito</a>";
                            html +="</div>";
                            html += "</div>";
                            html += "<div class='card-footer'>";

                            html += "<small class='text-muted'>&#9733; &#9733; &#9733; &#9733; &#9734;</small>";
                            html += "</div>";
                            html += "</div>";
                            html += "</div>";
    
                       /* html += "<a href='" + url +"' class='instagram-" + type_resource + "' rel='noopener' target='_blank'>"; */
                       /////////////////////////// html += "<img src='" + image + "' alt='" + escape_string(caption) + "'" + styles.gallery_image +" />";
                        
                        /* html += "</a>";*/
                        // html += "<span><br><br><br><br><br><br>" + escape_string(caption) + "<br></span>";
                        
                        }
                        
                    }
               
                    html += "Esta posicion se imprime fuera de los contenedores de los productos";
                   // html += "</div>";
                   
                }
            }
            
            if(options.display_igtv && typeof data.edge_felix_video_timeline !== "undefined"){
                var igtv = data.edge_felix_video_timeline.edges,
                    max = (igtv.length > options.items) ? options.items : igtv.length
                if(igtv.length > 0){
                    html += "";
                    for(var i = 0; i < max; i++){


                                        
                                        
                                        
                                        
                                    
                                    
                                        
                                    
                                    
                             

                        html += "";
                        html += "";
                        html += "";
                    }
                    html += "";
                }
            }
            $(options.container).html(html);
        }).fail(function(e){
            console.error("Instagram Feed: Unable to fetch the given user/tag. Instagram responded with the status code: ", e.status);
        })
        return true;
    };
    
})(jQuery);
