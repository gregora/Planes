if(localStorage.user){

  localStorage.user="";
  localStorage.cash="";
  localStorage.name="";



}


function signUp(){

  pswrd=document.getElementById("password").value;
  name=document.getElementById("name").value;

  message={
    "password": pswrd,
    "name": name,

  };

  $.post("/signup", message, function(res){

    if(res!="error"){

      res=JSON.parse(res);

      localStorage.user=res[0];
      localStorage.name=res[1];
      localStorage.cash=res[2];
      window.open("/", "_self");

    }else{

      alert("Something went wrong");

    }

  });

}


function login(){

  pswrd=document.getElementById("password").value;
  name=document.getElementById("name").value;


    message={
      "password": pswrd,
      "name": name,

    };

  $.post("/loginup", message, function(res){

    if(res!="error"){
      res=JSON.parse(res);


      localStorage.user=res[0];
      localStorage.name=res[1];
      localStorage.cash=res[2];
      window.open("/", "_self");

    }else{

      alert("Password or username is wrong");

    }

  })


}
