import { Component, OnInit,ViewChild } from '@angular/core';
import { ignoreElements, map } from 'rxjs/operators';
import { MatPaginator} from '@angular/material/paginator';
import {  MatTableDataSource } from '@angular/material/table';
import { Travel } from '../../models/voznja/voznja';
import { ActivatedRoute } from '@angular/router';
import { PutovanjeService } from '../../services/putovanje/putovanje.service';
import {MatSort, Sort} from '@angular/material/sort';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Building } from 'src/app/models/zgrada/zgrada';
import { LiftState } from 'src/app/models/lift/lift-state';
import { Observable } from 'rxjs';
import { AngularFireAction } from '@angular/fire/database';
import firebase from 'firebase';
import { LiftMeasure } from 'src/app/models/lift/lift-mjeri';
import { Lift } from 'src/app/models/lift/lift';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Colors, Label } from 'ng2-charts';
import { LiftService } from 'src/app/services/lift/lift.service';
interface Dani {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-ispis-voznji',
  templateUrl: './ispis-voznji.component.html',
  styleUrls: ['./ispis-voznji.component.css']
})
export class IspisVoznjiComponent implements OnInit {

  zgrada!: Building;
  podzg!: Building;
  lift!: Lift;
  lift_state!:LiftState;
  stanje!:String;
  mjeri_state!:LiftMeasure;
  prikazi!:boolean;
  
  id !:string;
  TravelData: any = [];
  LiftState :any;
  dataSource!: MatTableDataSource<Travel>;
  @ViewChild(MatPaginator,{static: true})
  paginator!: MatPaginator;
  isLoading = true;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  /*@ViewChild(MatSort)
  sort!: MatSort;*/
  displayedColumns: any[] = [
    'n_k',
    'v_k',
    'p_k',
    'z_k',
    'start_time',
    'end_time',
    'count_p'
  ];
  //
  pipe: DatePipe;
  mjeri$!: Observable<AngularFireAction<firebase.database.DataSnapshot>[]>;
  lift$!: Observable<AngularFireAction<firebase.database.DataSnapshot>[]>;




  filterForm = new FormGroup({
    fromDate: new FormControl(),
    toDate: new FormControl(),
});
  datepipe: any;



  get fromDate() { return this.filterForm.get('fromDate')!.value; }
   get toDate() { return this.filterForm.get('toDate')!.value; }
   //za broj voznji
   public barChartOptions: ChartOptions = {
    responsive: true,
    animation: {
      duration: 0 // general animation time
    },
    
    hover: {
      animationDuration: 0 // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0, // animation duration after a resize
    elements: {
      line: {
        tension: 0 // disables bezier curves
      }
    }

  };

  

  public barChartLabels: Label[] = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Cetvrtak', 'Petak', 'Subota', 'Nedjelja'];  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public colors: Colors[] = [
    {
      backgroundColor:     
        'rgb(0, 102, 255)'
      
    }
  ];

  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Series A' }
  ];
  data1: Array<number> =[0, 0, 0, 0, 0, 0, 0]
  
//za broj ljudi
public barChartOptions1: ChartOptions = {
  responsive: true,
  
    animation: {
      duration: 0 // general animation time
    },
    hover: {
      animationDuration: 0 // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0, // animation duration after a resize
    elements: {
      line: {
        tension: 0 // disables bezier curves
      }
    }
};
public barChartLabels1: Label[] = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Cetvrtak', 'Petak', 'Subota', 'Nedjelja'];
public barChartType1: ChartType = 'bar';
public barChartLegend1 = true;
public barChartPlugins1 = [];

public barChartData1: ChartDataSets[] = [
  { data: [], label: 'Series A' }
];
data2: Array<number> =[0, 0, 0, 0, 0, 0, 0]

//posjećenost katova
public barChartOptions2: ChartOptions = {
  responsive: true,
  
    animation: {
      duration: 0 // general animation time
    },
    hover: {
      animationDuration: 0 // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0, // animation duration after a resize
    elements: {
      line: {
        tension: 0 // disables bezier curves
      }
    }
};
public barChartLabels2: Label[] = [];
public barChartType2: ChartType = 'bar';
public barChartLegend2 = true;
public barChartPlugins2 = [];
public barChartData2: ChartDataSets[] = [
  { data: [], label: 'Series A' }
];
data3: Array<number> =[0, 0, 0, 0, 0, 0, 0]


//po satima
public barChartOptions3: ChartOptions = {
  responsive: true,
  
    animation: {
      duration: 0 // general animation time
    },
    hover: {
      animationDuration: 0 // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0, // animation duration after a resize
    elements: {
      line: {
        tension: 0 // disables bezier curves
      }
    }
};
public barChartLabels3: Label[] = [];
public barChartType3: ChartType = 'bar';
public barChartLegend3 = true;
public barChartPlugins3 = [];
public barChartData3: ChartDataSets[] = [
  { data: [], label: 'Series A'},
   { data:[], label: 'Series B' }
];
data4: Array<number> =[]
data5: Array<number> =[]
days :Dani[]=[
  {value:'Monday',viewValue:"Ponedjeljak"},
  {value:'Tuesday',viewValue:"Utorak"},
  {value:'Wednesday',viewValue:"Srijeda"},
  {value:'Thursday',viewValue:"Četvrtak"},
  {value:'Friday',viewValue:"Petak"},
  {value:'Saturday',viewValue:"Subota"},
  {value:'Sunday',viewValue:"Nedjelja"}
]

selectedValue: string='Monday';
najnizi!:number;
najvisi!:number| undefined;

travels$!: Observable<AngularFireAction<firebase.database.DataSnapshot>[]>;

  constructor(private travel_service: PutovanjeService,private actRoute: ActivatedRoute,
    private lift_service:LiftService) {
    this.id = this.actRoute.snapshot.paramMap.get('id')!;
    this.dataSource= new MatTableDataSource();
    this.pipe = new DatePipe('en');
    this.lift=history.state.data;
    this.zgrada=history.state.data1;
    this.setValues();
    console.log("Lift:",this.lift);
    //this.najnizi=this.lift.n_k;
    //this.najvisi=this.lift.v_k;
    this.lift$=this.lift_service.getLiftQuery(this.id)
    this.lift$.forEach(data =>{
      data.forEach((ele)=> { 
        this.lift=ele.payload.val();
        this.lift.key=ele.key!
        localStorage.setItem("Lift",JSON.stringify(this.lift));
        if(this.lift.is_connected){
          this.prikazi=true;
          this.mjeri$=this.travel_service.getMjeriQ(this.lift.key!);
          this.mjeri$.forEach(data =>{
               data.forEach((ele)=> { 
                 this.mjeri_state=ele.payload.val();
                 if(!this.mjeri_state.state){
                   this.stanje="Pokreni"
                   //console.log("Gumb",this.stanje);

                 }else if(this.mjeri_state.state){
    
                   this.stanje="Zaustavi"
                   //console.log("Gumb1",this.stanje);
    
                 }
              })
          })
        }else{
          this.prikazi=false;
        }

      })
 })
   

      //console.log("Podaci2",this.zgrada.ime);
      if(history.state.data2!=undefined){
          this.podzg=history.state.data2;
        }       
        
   }
   ngOnChanges():void{
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
   }
  ngOnInit(): void {
    this.TravelData = [];
    this.setValues();
    this.retrieveLifts();
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
   // console.log("Sort",this.sort);
    

  }


  setValues():void{
    //console.log("Tu0");
    if(history.state.data1!=undefined){
      //dosli s druge stranice
      if(localStorage.getItem("Zgrada")!="undefined" &&localStorage.getItem("Zgrada")!=null ){
        //postoje podaci vec neki o zgradi nekoj
        if(history.state.data1.key==JSON.parse(localStorage.getItem("Zgrada")!).key){
          //zgrada nova ista kao zapisana,spremamo nju
          var retrievedObject:any=localStorage.getItem("Zgrada");
          this.zgrada=JSON.parse(retrievedObject);          
        }else{
          //nova zgrada ,zapisujemo ju
          this.zgrada=history.state.data1;
          localStorage.setItem("Zgrada",JSON.stringify(this.zgrada));
        }
      }else{
        //ne postoji zapis, zapisujemo ju
        this.zgrada=history.state.data1;
        localStorage.setItem("Zgrada",JSON.stringify(this.zgrada));
      }
    }else{
      //refresh se dogodio
      var retrievedObject:any=localStorage.getItem("Zgrada");
      this.zgrada=JSON.parse(retrievedObject);
    }
    
    if(history.state.data1!=undefined &&history.state.data2!=undefined){
      //dosli smo s prethodne stranice
      if(localStorage.getItem("Pod")!=null){
        //postoji zapis u local storage
        if(history.state.data2.key==JSON.parse(localStorage.getItem("Pod")!).key){
          //dobiveni podatak je jednak onom u local storage,prekopiraj ga
          this.podzg=JSON.parse(localStorage.getItem("Pod")!);
        }else{
          //dobiveni podatak nije isti onom u local storage
          this.podzg=history.state.data2;
          localStorage.setItem("Pod",JSON.stringify(this.podzg));
        }
      }else{
        //ne postoji zapis u local storage
        this.podzg=history.state.data2;
        localStorage.setItem("Pod",JSON.stringify(this.podzg));
      }
    }else if(history.state.data1!=undefined &&history.state.data2==undefined){      
      // ne postoji podzgrada
      if(localStorage.getItem("Pod")!=null){
        localStorage.removeItem("Pod");
      }     
    }else{
       //ako nema nijednoga onda je refresh  
       this.podzg=JSON.parse(localStorage.getItem("Pod")!);
    }

    if(history.state.data!=undefined){
      //dosli s druge stranice
      if(localStorage.getItem("Lift")!="undefined" && localStorage.getItem("Lift")!=null){
        //postoje podaci vec neki o lift nekoj
        if(history.state.data.key==JSON.parse(localStorage.getItem("Lift")!).key){
          //lift nova ista kao zapisana,spremamo nju
          var retrievedObject:any=localStorage.getItem("Lift");
          this.lift=JSON.parse(retrievedObject);          
        }else{
          //nova lift ,zapisujemo ju
          this.lift=history.state.data;
          localStorage.setItem("Lift",JSON.stringify(this.lift));
        }
      }else{
        //ne postoji zapis, zapisujemo ju
        this.lift=history.state.data;
        localStorage.setItem("Lift",JSON.stringify(this.lift));
      }
    }else{
      //refresh se dogodio
      var retrievedObject:any=localStorage.getItem("Lift");
      this.lift=JSON.parse(retrievedObject);
    }
    //this.najnizi=this.lift.n_k;
    //this.najvisi=this.lift.v_k;

  }
  retrieveLifts() {
    this.travels$=this.travel_service.getListPutovanjaQuery(this.id);
    this.travels$.forEach(data =>{
      this.TravelData=[];
         data.forEach((ele)=> { 
          this.TravelData.push(ele.payload.val() as Travel)
        })
        if(data.length==0){
          //console.log("Vrtim1");
          this.isLoading=false;
        }else{
          //console.log("Vrtim");
          this.isLoading=false;
        }
      
        //dodajem kod ovdje

//console.log("Travel",this.TravelData);
//console.log("Travel1:",data);
let lista_katova: number[]=[];
if(this.TravelData.length!=0 && this.TravelData!=undefined && this.TravelData!=null){
  for(let i=0; i<this.TravelData.length;i++){
    this.TravelData[i].start_time=this.pipe.transform(this.TravelData[i].start_time, 'MM/dd/yyyy, HH:mm:ss')
    this.TravelData[i].end_time=this.pipe.transform(this.TravelData[i].end_time, 'MM/dd/yyyy, HH:mm:ss')
    
  }
  //this.najvisi=this.TravelData[this.TravelData.length-1].v_k;
  //this.najnizi=this.TravelData[this.TravelData.length-1].n_k;
  //console.log("Lift_data",this.lift.n_k,this.lift.v_k);
  this.najvisi=this.lift.n_k;
  this.najnizi!=this.lift.v_k;
  //console.log("Katovi",this.najnizi,this.najvisi)
  //let lista_katova: number[]=[];
  this.data3=[];
 // if(this.najvisi!=undefined && this.najnizi!=undefined){
    let k=0;
    this.barChartLabels2=[]

    for(let i=this.lift.n_k;i!<=this.lift.v_k!;i!++){
      //console.log("Label1",i);
      this.barChartLabels2.push(i+"")
      //this.barChartLabels2[k]=i+"";
      k++;
      lista_katova.push(i!);
      this.data3.push(0);

    }
    //console.log("lista katova",lista_katova);
    
    this.barChartLabels3=[]

    for(let i=0;i<=23;i++){
      //console.log("Label1",i);
      //if(i==24){}
      this.barChartLabels3.push(i+"")
      //this.barChartLabels2[k]=i+"";
      this.data4.push(0);
      this.data5.push(0);

    }
    //console.log("Podaci",this.barChartLabels3);

  //}
}



//console.log("Labels",this.barChartLabels2);
this.data1 =[0, 0, 0, 0, 0, 0, 0]
this.data2 =[0, 0, 0, 0, 0, 0, 0]
if(this.TravelData.length>0){
  this.TravelData.forEach((el:any)=>      {

    let day=this.pipe.transform(el.start_time,'EEEE')
    //console.log("Dan",day);
    switch (day) {
      case "Sunday":
        //console.log("Br_ljudi",el.count_p)
        this.data1[6]=this.data1[6]+1;
        this.data2[6]=this.data2[6]+el.count_p;
          //console.log("It is a Sunday.");
          break;
      case "Monday":
        this.data1[0]=this.data1[0]+1;
        this.data2[0]=this.data2[0]+el.count_p;
          //console.log("It is a Monday.");
          break;
      case "Tuesday":
        this.data1[1]=this.data1[1]+1;
        this.data2[1]=this.data2[1]+el.count_p;
          //console.log("It is a Tuesday.");
          break;
      case "Wednesday":
        this.data1[2]=this.data1[2]+1;
        this.data2[2]=this.data2[2]+el.count_p;
          //console.log("It is a Wednesday.");
          break;
      case "Thursday":
        this.data1[3]=this.data1[3]+1;
        this.data2[3]=this.data2[3]+el.count_p;
          //console.log("It is a Thursday.");
          break;
      case "Friday":
        this.data1[4]=this.data1[4]+1;
        this.data2[4]=this.data2[4]+el.count_p;
          //console.log("It is a Friday.");
          break;
      case "Saturday":
        this.data1[5]=this.data1[5]+1;
        this.data2[5]=this.data2[5]+el.count_p;
          //console.log("It is a Saturday.");
          break;
      default:
          break;
  }

  if(day=="Monday"){
    let hour=this.pipe.transform(el.start_time,'H')


    switch (hour) {
      case "0":
        //console.log("Br_ljudi",el.count_p)
        this.data4[0]=this.data4[0]+1;
        this.data5[0]=this.data5[0]+el.count_p;
          //console.log("It is a Sunday.");
          break;
      case "1":
        this.data4[1]=this.data4[1]+1;
        this.data5[1]=this.data5[1]+el.count_p;
          //console.log("It is a Monday.");
          break;
      case "2":
        this.data4[2]=this.data4[2]+1;
        this.data5[2]=this.data5[2]+el.count_p;
          //console.log("It is a Tuesday.");
          break;
      case "3":
        this.data4[3]=this.data4[3]+1;
        this.data5[3]=this.data5[3]+el.count_p;
          //console.log("It is a Wednesday.");
          break;
      case "4":
        this.data4[4]=this.data4[4]+1;
        this.data5[4]=this.data5[4]+el.count_p;
          //console.log("It is a Thursday.");
          break;
      case "5":
        this.data4[5]=this.data4[5]+1;
        this.data5[5]=this.data5[5]+el.count_p;
          //console.log("It is a Friday.");
          break;
      case "6":
        this.data4[6]=this.data4[6]+1;
        this.data5[6]=this.data5[6]+el.count_p;
          //console.log("It is a Saturday.");
          break;
      case "7":
        //console.log("Br_ljudi",el.count_p)
        this.data4[7]=this.data4[7]+1;
        this.data5[7]=this.data5[7]+el.count_p;
          //console.log("It is a Sunday.");
          break;
      case "8":
        this.data4[8]=this.data4[8]+1;
        this.data5[8]=this.data5[8]+el.count_p;
          //console.log("It is a Monday.");
          break;
      case "9":
        this.data4[9]=this.data4[9]+1;
        this.data5[9]=this.data5[9]+el.count_p;
          //console.log("It is a Tuesday.");
          break;
      case "10":
        this.data4[10]=this.data4[10]+1;
        this.data5[10]=this.data5[10]+el.count_p;
          //console.log("It is a Wednesday.");
          break;
      case "11":
        this.data4[11]=this.data4[11]+1;
        this.data5[11]=this.data5[11]+el.count_p;
          //console.log("It is a Thursday.");
          break;
      case "12":
        this.data4[12]=this.data4[12]+1;
        this.data5[12]=this.data5[12]+el.count_p;
          //console.log("It is a Friday.");
          break;
      case "13":
        this.data4[13]=this.data4[13]+1;
        this.data5[13]=this.data5[13]+el.count_p;
          //console.log("It is a Saturday.");
          break;
     
      case "14":
        this.data4[14]=this.data4[14]+1;
        this.data5[14]=this.data5[14]+el.count_p;
          //console.log("It is a Monday.");
          break;
      case "15":
        this.data4[15]=this.data4[15]+1;
        this.data5[15]=this.data5[15]+el.count_p;
          //console.log("It is a Tuesday.");
          break;
      case "16":
        this.data4[16]=this.data4[16]+1;
        this.data5[16]=this.data5[16]+el.count_p;
          //console.log("It is a Wednesday.");
          break;
      case "17":
        this.data4[17]=this.data4[17]+1;
        this.data5[17]=this.data5[17]+el.count_p;
          //console.log("It is a Thursday.");
          break;
      case "18":
        this.data4[18]=this.data4[18]+1;
        this.data5[18]=this.data5[18]+el.count_p;
          //console.log("It is a Friday.");
          break;
      case "19":
        this.data4[19]=this.data4[19]+1;
        this.data5[19]=this.data5[19]+el.count_p;
          //console.log("It is a Saturday.");
          break;
      case "20":
        //console.log("Br_ljudi",el.count_p)
        this.data4[20]=this.data4[20]+1;
        this.data5[20]=this.data5[20]+el.count_p;
          //console.log("It is a Sunday.");
          break;
      case "21":
        this.data4[21]=this.data4[21]+1;
        this.data5[21]=this.data5[21]+el.count_p;
          //console.log("It is a Monday.");
          break;
      case "22":
        this.data4[22]=this.data4[22]+1;
        this.data5[22]=this.data5[22]+el.count_p;
          //console.log("It is a Tuesday.");
          break;
      case "23":
        this.data4[23]=this.data4[23]+1;
        this.data5[23]=this.data5[23]+el.count_p;
          //console.log("It is a Wednesday.");
          break;
      
      default:
          break;

  }
  //console.log("Liste",this.data4,this.data5);
  }
  
  

  for(let i=0;i<lista_katova.length;i++){
    if(el.p_k==lista_katova[i]){
      this.data3[i]++;

    }
    if(el.z_k==lista_katova[i]){
      this.data3[i]++;
    }
    
  }

 
  
  })
}



this.barChartData=[
  { data: this.data1, label: 'Broj vožnji liftom' }
];
this.barChartData1=[
  { data: this.data2, label: 'Broj ljudi dnevno' }
];
this.barChartData2=[
  { data: this.data3, label: 'Posjećenost kata' }
];
this.barChartData3=[
  { data: this.data4, label: 'Broj vožnji' },
  { data: this.data5, label: 'Broj ljudi' }

];


  this.dataSource = new MatTableDataSource(this.TravelData);
  setTimeout(() => {
    this.dataSource.sort = this.sort;

    this.dataSource.paginator = this.paginator;
  }, 0);

    })
   
  
    

    this.travel_service.getStateLift().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.key, ...c.payload.val()
            
          })
          
        )
      )
    ).subscribe(
      data => {
        data.forEach(item=>{
          if(item.key==this.id){
            this.lift_state=item;
          }
        })
      });


     
      

      
  }
  
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  //

applyFilterDate() {

  this.dataSource.data=this.TravelData.filter( (data: { start_time: string | number | Date; end_time: string | number | Date; })=>{

    if (this.fromDate && !this.toDate){
      return this.pipe.transform(data.start_time,'shortDate')! >= this.pipe.transform(this.fromDate,'shortDate')! ;
    }else if(!this.fromDate && this.toDate){
      return  this.pipe.transform(data.end_time,'shortDate')! <=  this.pipe.transform(this.toDate,'shortDate')!;
    }
    else if (this.fromDate && this.toDate) {
      return this.pipe.transform(data.start_time,'shortDate')! >= this.pipe.transform(this.fromDate,'shortDate')! && this.pipe.transform(data.end_time,'shortDate')! <=  this.pipe.transform(this.toDate,'shortDate')!;
      }
  return true;
   }
  );
 
}
clearFromDate() 
{
  this.filterForm.reset();
  this.dataSource.data=this.TravelData;
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}

promjeni(){
  if(this.stanje=="Zaustavi"){
    this.mjeri_state.state=false;
    this.travel_service.updateMjeri(this.id,this.mjeri_state)
    
    
  }else if(this.stanje=="Pokreni"){
    this.mjeri_state.state=true;
    this.travel_service.updateMjeri(this.id,this.mjeri_state)


  }
}

Skini(hist:string){
  switch (hist) {
    case 'voznja':
      var canvas : any = document.getElementById(hist);
      break;
    case 'ljudi':
      var canvas : any = document.getElementById(hist);
      break;
    case 'kat':
      var canvas : any = document.getElementById(hist);
      
      break;
    case 'dan':
      var canvas : any = document.getElementById(hist);
      //todo dodaj za zadnji download

  }
  
  var ctx = canvas.getContext("2d");
  ctx.globalCompositeOperation = 'destination-over'
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var dataURL = canvas.toDataURL("image/png", 1.0);
  var link = document.createElement('a');
  link.download = "my-chart.png";
  link.href = dataURL;
  link.click();

}

changeDay(event:any){
  //console.log(event.value);
  this.data5=this.data5.map(x=>0)
  this.data4=this.data4.map(x=>0)

  //console.log("Data:",this.data5,this.data4)
  this.TravelData.forEach((el:any)=>      {
    let day=this.pipe.transform(el.start_time,'EEEE')
    //console.log("Dan:",day,day==event.value)
    if(day==event.value){
      let hour=this.pipe.transform(el.start_time,'H')
      //console.log("Sat",hour,el.count_p)

      this.odabraniDan(hour!,el.count_p);

    }

    })
    //console.log("Data:",this.data5,this.data4)


  this.barChartData3=[
    { data: this.data4, label: 'Broj vožnji' },
    { data: this.data5, label: 'Broj ljudi' }
  
  ];
}
odabraniDan(hour:string,count_p:number){
  switch (hour) {
    case "0":
      //console.log("Br_ljudi",el.count_p)
      this.data4[0]=this.data4[0]+1;
      this.data5[0]=this.data5[0]+count_p;
        //console.log("It is a Sunday.");
        break;
    case "1":
      this.data4[1]=this.data4[1]+1;
      this.data5[1]=this.data5[1]+count_p;
        //console.log("It is a Monday.");
        break;
    case "2":
      this.data4[2]=this.data4[2]+1;
      this.data5[2]=this.data5[2]+count_p;
        //console.log("It is a Tuesday.");
        break;
    case "3":
      this.data4[3]=this.data4[3]+1;
      this.data5[3]=this.data5[3]+count_p;
        //console.log("It is a Wednesday.");
        break;
    case "4":
      this.data4[4]=this.data4[4]+1;
      this.data5[4]=this.data5[4]+count_p;
        //console.log("It is a Thursday.");
        break;
    case "5":
      this.data4[5]=this.data4[5]+1;
      this.data5[5]=this.data5[5]+count_p;
        //console.log("It is a Friday.");
        break;
    case "6":
      this.data4[6]=this.data4[6]+1;
      this.data5[6]=this.data5[6]+count_p;
        //console.log("It is a Saturday.");
        break;
    case "7":
      //console.log("Br_ljudi",el.count_p)
      this.data4[7]=this.data4[7]+1;
      this.data5[7]=this.data5[7]+count_p;
        //console.log("It is a Sunday.");
        break;
    case "8":
      this.data4[8]=this.data4[8]+1;
      this.data5[8]=this.data5[8]+count_p;
        //console.log("It is a Monday.");
        break;
    case "9":
      this.data4[9]=this.data4[9]+1;
      this.data5[9]=this.data5[9]+count_p;
        //console.log("It is a Tuesday.");
        break;
    case "10":
      this.data4[10]=this.data4[10]+1;
      this.data5[10]=this.data5[10]+count_p;
        //console.log("It is a Wednesday.");
        break;
    case "11":
      this.data4[11]=this.data4[11]+1;
      this.data5[11]=this.data5[11]+count_p;
        //console.log("It is a Thursday.");
        break;
    case "12":
      this.data4[12]=this.data4[12]+1;
      this.data5[12]=this.data5[12]+count_p;
        //console.log("It is a Friday.");
        break;
    case "13":
      this.data4[13]=this.data4[13]+1;
      this.data5[13]=this.data5[13]+count_p;
        //console.log("It is a Saturday.");
        break;
   
    case "14":
      this.data4[14]=this.data4[14]+1;
      this.data5[14]=this.data5[14]+count_p;
        //console.log("It is a Monday.");
        break;
    case "15":
      this.data4[15]=this.data4[15]+1;
      this.data5[15]=this.data5[15]+count_p;
        //console.log("It is a Tuesday.");
        break;
    case "16":
      this.data4[16]=this.data4[16]+1;
      this.data5[16]=this.data5[16]+count_p;
        //console.log("It is a Wednesday.");
        break;
    case "17":
      this.data4[17]=this.data4[17]+1;
      this.data5[17]=this.data5[17]+count_p;
        //console.log("It is a Thursday.");
        break;
    case "18":
      this.data4[18]=this.data4[18]+1;
      this.data5[18]=this.data5[18]+count_p;
        //console.log("It is a Friday.");
        break;
    case "19":
      this.data4[19]=this.data4[19]+1;
      this.data5[19]=this.data5[19]+count_p;
        //console.log("It is a Saturday.");
        break;
    case "20":
      //console.log("Br_ljudi",el.count_p)
      this.data4[20]=this.data4[20]+1;
      this.data5[20]=this.data5[20]+count_p;
        //console.log("It is a Sunday.");
        break;
    case "21":
      this.data4[21]=this.data4[21]+1;
      this.data5[21]=this.data5[21]+count_p;
        //console.log("It is a Monday.");
        break;
    case "22":
      this.data4[22]=this.data4[22]+1;
      this.data5[22]=this.data5[22]+count_p;
        //console.log("It is a Tuesday.");
        break;
    case "23":
      this.data4[23]=this.data4[23]+1;
      this.data5[23]=this.data5[23]+count_p;
        //console.log("It is a Wednesday.");
        break;
    
    default:
        break;

}
}
}


