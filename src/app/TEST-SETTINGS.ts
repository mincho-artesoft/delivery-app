export const SETTINGS = {
  pages: [
    {
      path: 'warehouse',
      title: 'Warehouses',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      get: { 
        url: 'https://06hbbmv516.execute-api.eu-central-1.amazonaws.com/api/warehouse/warehouse',
        Yget: "/warehouses?path=${path}"
      },
      formArray: 'list-warehouses',
      data: 'warehouses',
      separator: null,
      showHeaders: true,
      menuView: {
        'name': 'Warehouse',
        'icon': 'storage',
        'tooltip': 'Warehouse',
        'label': 'Warehouse',
        'path': '/warehouse',
      },
      navbar: {
        buttons: [
          {
            label: 'Add new',
            action: 'create',
            path: 'warehouses.edit',
            openSidenav: true,
            color: 'accent',
            active: true,
            icon: 'add_box'
          },
          {
            label: 'Edit',
            action: 'edit',
            path: 'warehouses.edit',
            color: 'primary',
            openSidenav: true,
            icon: 'create',
            active: true
          },
          {
            label: 'Delete',
            action: 'delete',
            isDialog: true,
            active: true,
            icon: 'delete',
            color: 'warn',
            deletePath: 'https://06hbbmv516.execute-api.eu-central-1.amazonaws.com/api/warehouse/warehouse/${_id}',
            message: 'Restaurant with ${_id} was successfully deleted'
          }
        ],
      },
      update: {
        post: 'https://06hbbmv516.execute-api.eu-central-1.amazonaws.com/api/warehouse/warehouse',
        put: 'https://06hbbmv516.execute-api.eu-central-1.amazonaws.com/api/warehouse/warehouse/${_id}'
      },
      columns: [
        {
          data: 'name',
          title: 'Name',
          renderer: 'objectRenderer',
          label: '${en}',
          className: 'name',
          width: 120,
        },
        {
          data: 'brand_name',
          title: 'Brand Name',
          className: 'nameRestaurant',
          width: 120,
        },
        {
          data: 'description',
          title: 'Description',
          renderer: 'objectRenderer',
          label: '${en}',
          className: 'description',
          width: 120,
        },
        {
          data: 'unit',
          title: 'Unit',
          className: 'unit',
          width: 120,
        },
        {
          data: 'quantity',
          title: 'Quantity',
          className: 'quantity',
          width: 120,
        },
        {
          data: 'tags',
          title: 'Tags',
          className: 'tags',
          width: 120,
        },
        {
          data: 'price',
          title: 'Price',
          className: 'price',
          width: 120,
        },
        {
          data: 'currentProducts',
          title: 'Current Products',
          renderer: 'objectRenderer',
          label: '${quantity}-${expirationDate}',
          className: 'currentProducts',
          width: 120,
        },
        {
          data: 'ingredients',
          title: 'Ingredients',
          renderer: 'objectRenderer',
          label: '${quantity}-${productId}',
          className: 'ingredients',
          width: 120,
        },
        {
          data: 'images',
          title: 'Images',
          className: 'images',
          width: 120,
        }
        ,
        {
          data: 'createdAt',
          title: 'CreatedAt',
          className: 'createdAt',
          width: 120,
        }
        ,
        {
          data: 'updatedAt',
          title: 'UpdatedAt',
          className: 'updatedAt',
          width: 120,
        }

      ]
    },
    {
      path: 'warehouses.edit',
      title: 'Warehouses Edit',
      multilanguage: {
        data: 'language',
        tabs: '${organization.languages}',
        editor: 'MultiLanguage',
        showTabs: true,
        columns: [{
          title: 'Title',
          data: 'titles.${organization.languages[${index}]}',
          validators: {required: true}, // custom validator for default lang
        }, {
          title: 'Description',
          data: 'description.${organization.languages[${index}]}',
        }]
      },
      navbar: {
        reversed: true,
        buttons: [

          {
            label: 'Close',
            action: 'close',
            icon: 'close',
            active: true
          },
          {
            label: 'Save',
            action: 'save',
            icon: 'check',
            active: true,
          },
        ]
      },
      update: {
        post: 'https://06hbbmv516.execute-api.eu-central-1.amazonaws.com/api/warehouse/warehouse',
        put: 'https://06hbbmv516.execute-api.eu-central-1.amazonaws.com/api/warehouse/warehouse/${_id}'
      },
      get: { url: 'https://06hbbmv516.execute-api.eu-central-1.amazonaws.com/api/warehouse/warehouse/${_id}' },
      columns: [
        {
          data: 'name',
          title: 'Name',
          renderer: 'objectRenderer',
          label: '${en}',
          className: 'name',
          width: 120,
        },
        {
          data: 'brand_name',
          title: 'Brand Name',
          className: 'nameRestaurant',
          width: 120,
        },
        {
          data: 'description',
          title: 'Description',
          renderer: 'objectRenderer',
          label: '${en}',
          className: 'description',
          width: 120,
        },
        {
          data: 'unit',
          title: 'Unit',
          className: 'unit',
          width: 120,
        },
        {
          data: 'quantity',
          title: 'Quantity',
          className: 'quantity',
          width: 120,
        },
        {
          data: 'tags',
          title: 'Tags',
          className: 'tags',
          width: 120,
        },
        {
          data: 'price',
          title: 'Price',
          className: 'price',
          width: 120,
        },
        {
          data: 'currentProducts',
          title: 'Current Products',
          renderer: 'objectRenderer',
          label: '${quantity}-${expirationDate}',
          className: 'currentProducts',
          width: 120,
        },
        {
          data: 'ingredients',
          title: 'Ingredients',
          renderer: 'objectRenderer',
          label: '${quantity}-${productId}',
          className: 'ingredients',
          width: 120,
        },
        {
          data: 'images',
          title: 'Images',
          className: 'images',
          width: 120,
        }
        ,
        {
          data: 'createdAt',
          title: 'CreatedAt',
          className: 'createdAt',
          width: 120,
        }
        ,
        {
          data: 'updatedAt',
          title: 'UpdatedAt',
          className: 'updatedAt',
          width: 120,
        }

      ]
    },
   
    {
      path: 'restaurants',
      title: 'Restaurants',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      get: { 
        url: 'https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/auth/organization', 
        Yget: "organizations" 
      },
      delete: {
        Ydelete: "?path=${path}"
      },
      formArray: 'list-restaurants',
      data: 'restaurants',
      separator: null,
      showHeaders: false,
      menuView: {
        'name': 'Restaurants',
        'icon': 'restaurant',
        'tooltip': 'Restaurants',
        'label': 'Restaurants',
        'path': '/restaurants',
      },
      multilanguage: {
        data: 'language',
          tabs: '${organization.languages}',
          editor: 'MultiLanguage',
          showTabs: true,
          columns: [{
            title: 'Title',
            data: 'titles.${organization.languages[${index}]}',
            validators: {required: true}, // custom validator for default lang
          }, {
            title: 'Description',
            data: 'description.${organization.languages[${index}]}',
          }]
        
      },
      navbar: {
        buttons: [
          {
            label: 'Add new',
            action: 'create',
            path: 'restaurants.edit',
            openSidenav: true,
            color: 'accent',
            active: true,
            icon: 'add_box'
          },
          {
            label: 'Edit',
            action: 'edit',
            path: 'restaurants.edit',
            color: 'primary',
            openSidenav: true,
            icon: 'create',
            active: true
          },
          {
            label: 'Delete',
            action: 'delete',
            isDialog: true,
            active: true,
            icon: 'delete',
            color: 'warn',
            deletePath: "?path=${path}",
            message: 'Restaurant with ${_id} was successfully deleted'
          }
        ],
      },
      update: {
        post: 'https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/organization',
        put: 'https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/organization${_id}',
      },
      columns: [
        {
          data: 'img',
          title: 'Picture',
          className: 'circle-small'
        },
        {
          data: 'name',
          title: 'Name restaurant',
          className: 'nameRestaurant'
        },
        {
          data: 'deliveryTime',
          title: 'Delivery time',
          className: 'deliveryTime'
        },
        {
          data: 'domain',
          title: 'Domain',
          className: 'domain'
        },
        {
          data: 'eik',
          title: 'EIK',
          className: 'eik'
        },
        {
          data: 'phoneNumber',
          title: 'Phone number',
          className: '',
          editor: {
            editorIcon: 'edit',
            editorColor: 'primary',
            actionIcon: 'send',
            actionColor: 'warn',
            name: 'FastEditor',
            url: 'url',
            message: 'Item with ${name} was succesfully updated'
          }
        },
        {
          data: 'freeShipping',
          title: 'Free shipping',
          className: ''
        },
        {
          data: 'addresses',
          title: 'Addresses',
          className: ''
        },
        {
          data: 'tags',
          title: 'tags',
          width: 160,
          className: ''
        }
        ,
        {
          data: 'workingDays',
          title: 'Working days',
          className: ''
        }
        ,
        {
          data: 'workingHours',
          title: 'Working hours',
          className: ''
        }

      ]
    },
    
    {
      path: 'restaurants.edit',
      title: 'Restaurants Edit',
      multilanguage: {
        data: 'language',
        tabs: '${organization.languages}',
        editor: 'MultiLanguage',
        showTabs: true,
        columns: [{
          title: 'Title',
          data: 'titles.${organization.languages[${index}]}',
          validators: {required: true}, // custom validator for default lang
        }, {
          title: 'Description',
          data: 'description.${organization.languages[${index}]}',
        }]
      },
      navbar: {
        reversed: true,
        buttons: [

          {
            label: 'Close',
            action: 'close',
            icon: 'close',
            active: true
          },
          {
            label: 'Save',
            Ypost: "?path=${uuid}",
            action: 'save',
            icon: 'check',
            active: true,
          },
        ]
      },
      update: {
        Ypost: "/organization?path=${uuid}",
        Yput: "/organization?path=${uuid}",
        post: 'https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/auth/organization',
        put: 'https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/auth/organization${_id}'
      },
      get: { 
        url: 'https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api/auth/organization/${_id}',
        Yget: "?path=${path}"
      },
      columns: [
        {
          data: 'test',
          title: 'test',
          className: 'test',
         
        },
        {
          data: 'titles',
          tabs: '${collectedData.languages}',
          controlType: 'MultilangFormGroup',
          showTabs: true,
          editor: 'multilanguage',
          columns: [{
            title: 'Title',
            data: 'title',
            validators: [{ name: 'required' }],
          }, {
            title: 'Description',
            data: 'description',
          }]
        },
        {
          data: '_id',
          title: 'id',
          readOnly: true,
          className: 'col-2xl-12 col-md-12 col-xs-12',
        },
        {
          data: 'name',
          title: 'Name',
          default: 'name-default',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
          ]
        },
        {
          data: 'domain',
          title: 'Domain',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' }
          ]
        },
        {
          data: 'tags',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Tags',
          validators: [
            {
              name: 'asyncVal',
              arg: {
                interpolate: '"${root.controls.name.value}" === "${root.controls.domain.value}" ',
                props: ['root.controls.domain', 'root.controls.name']
              }
            }
          ],

        },
        {
          data: 'workingHours',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          autopopulate: 'workingDays',
          title: 'Working Hours',

        },
        {
          data: 'workingDays',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          autopopulate: 'workingHours',
          title: 'Working Days',
          baseUrl: 'http://localhost:3000/options',
          page: 1,
          size: 50,
          // controlType: 'DropdownControl',
        },
        // {
        //   data: 'deliveryTime.seconds',
        //   className: 'col-2xl-6 col-md-6 col-xs-12',
        //   title: 'Delivery Time'
        // },
        // {
        //   data: 'deliveryTime.minutes',
        //   className: 'col-2xl-6 col-md-6 col-xs-12',
        //   title: 'Delivery Time'
        // },
        {
          data: 'freeShipping',
          title: 'Free Shipping',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          editor: 'toggleButton'
        },
        {
          data: 'eik',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'EIK',
          number: true,
          validators:
            [
              { name: 'number' }
            ]
        },
        {
          data: 'langRequired',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Language required'
        },
        {
          data: 'langOptional',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Language Optional',
        },

        // {
        //   data: 'address',
        //   className: '',
        //   title: 'Addresses',
        //   editor: 'addressesEditor',
        //   cells: [
        //     {
        //       data: 'street',
        //       title: 'Street',
        //       className: 'nested-input',
        //       validators: [
        //         { name: 'required' }
        //       ]
        //     },
        //     {
        //       data: 'city',
        //       title: 'City',
        //       className: 'nested-input',
        //       validators: [
        //         { name: 'required' }
        //       ]
        //     },
        //     {
        //       data: 'state',
        //       title: 'State',
        //       className: 'nested-input',
        //       validators: [
        //         { name: 'required' },
        //       ]
        //     },
        //     {
        //       data: 'zipCode',
        //       title: 'ZIP Code',
        //       className: 'nested-input',
        //       validators: [
        //         { name: 'required' },
        //         { name: 'number' }
        //       ]
        //     },
        //     {
        //       data: 'location.latitude',
        //       title: 'Latitude',
        //       className: 'nested-input',
        //       validators: [
        //         { name: 'required' }
        //       ]
        //     },
        //     {
        //       data: 'location.longitude',
        //       title: 'Longtitude',
        //       className: 'nested-input',
        //       validators: [
        //         { name: 'required' }
        //       ]
        //     },
        //     {
        //       data: 'country',
        //       title: 'Country',
        //       className: 'nested-input',
        //       validators: [
        //         { name: 'required' }
        //       ]
        //     }
        //   ]
        // },
        {
          data: 'phoneNumber',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Phone Number'
        },
        {
          data: 'created_at',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'created at',
          editor: 'dataPicker'
        },
        {
          data: 'updated_at',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'updated at',
          editor: 'dataPicker'
        }
      ]
    }
  ]
}