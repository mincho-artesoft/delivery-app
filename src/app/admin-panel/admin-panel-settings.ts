export const ADMIN_PANEL_SETTINGS = {
  pages: [
    {
      path: 'warehouses',
      title: 'Warehouses',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      get: { url: 'https://06hbbmv516.execute-api.eu-central-1.amazonaws.com/api/warehouse/warehouse' },
      yGet: '/warehouses?orgID=uuid',
      separator: null,
      showHeaders: true,
      menuView: {
        'name': 'Warehouses',
        'icon': 'storage',
        'tooltip': 'Warehouses',
        'label': 'Warehouses',
        'path': '/warehouses',
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
          validators: { required: true }, // custom validator for default lang
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
      path: 'organizations',
      title: 'Restaurants',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: '/organizations',
      separator: null,
      showHeaders: true,
      menuView: {
        'name': 'Restaurants',
        'icon': 'restaurant',
        'tooltip': 'Restaurants',
        'label': 'Restaurants',
        'path': '/organizations',
      },
      navbar: {
        buttons: [
          {
            label: 'Add new',
            action: 'create',
            path: 'organizations.edit',
            openSidenav: true,
            color: 'accent',
            active: true,
            icon: 'add_box'
          },
          {
            label: 'Edit',
            action: 'edit',
            path: 'organizations.edit',
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
            deletePath: '/organization?path=${_id}',
            message: 'Restaurant with ${_id} was successfully deleted'
          }
        ],
      },
      columns: [
        {
          data: '_id',
          title: 'ID',
          sortable: true,
          width: 80,
        },
        {
          data: 'img',
          title: 'Picture',
        },
        {
          data: 'name',
          title: 'Name restaurant',
          renderer: 'objectRenderer',
          label: '${controls.name.value.${controls.language.value}}',
        },
        {
          data: 'deliveryTime',
          title: 'Delivery time',
        },
        {
          data: 'domain',
          title: 'Domain',
        },
        {
          data: 'eik',
          title: 'EIK',
        },
        {
          data: 'phoneNumber',
          title: 'Phone number',
          editor: {
            editorIcon: 'edit',
            editorColor: 'primary',
            actionButton: {
              icon: 'send',
              color: 'warn',
              action: 'save'
            },
            name: 'FastEditor',
            url: 'url',
            message: 'Item with ${name} was succesfully updated'
          }
        },
        {
          data: 'freeShipping',
          title: 'Free shipping',
        },
        {
          data: 'addresses',
          title: 'Addresses',
        },
        {
          data: 'tags',
          title: 'tags',
          width: 160,
        }
        ,
        {
          data: 'workingDays',
          title: 'Working days',
        }
        ,
        {
          data: 'workingHours',
          title: 'Working hours',
        }

      ]
    },

    {
      path: 'organizations.edit',
      title: 'Restaurants Edit',
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
      yGet: '/organization?path=${_id}',
      yPost: '/organization?path=${_id}',
      columns: [
        {
          data: 'language',
          editor: 'hidden'
        },
        {
          data: '_id',
          title: 'id',
          readOnly: true,
          className: 'col-2xl-12 col-md-12 col-xs-12',
        },
        {
          data: 'languages',
          showTabs: true,
          editor: 'multiLang',
        },
        {
          data: 'name',
          title: 'Name',
          controlType: 'BaseExtendedFormGroup',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
          ],
          editor: 'langLinked'
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
          default: [],
          editor: 'chipListEditor'
        },
        {
          data: 'workingHours',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            { name: 'number' }
          ],
          title: 'Working Hours',

        },
        {
          data: 'workingDays',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            { name: 'number' }
          ],
          title: 'Working Days',
        },
        {
          data: 'deliveryTime',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Delivery Time',
          validators: [
            { name: 'number' }
          ]
        },
        {
          data: 'freeShipping',
          title: 'Free Shipping',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          default: false,
          editor: 'toggleButton'
        },
        {
          data: 'eik',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'EIK',
          validators: [
            { name: 'number' },
            { name: 'required' }
          ]
        },
        {
          data: 'langRequired',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Language required',
          validators: [
            { name: 'required' },

          ]
        },
        {
          data: 'langOptional',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Language Optional',
        },
        {
          data: 'address.country',
          title: 'Country',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' }
          ]
        },
        {
          data: 'address.state',
          title: 'State',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
          ]
        },
        {
          data: 'address.city',
          title: 'City',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' }
          ]
        },
        {
          data: 'address.street',
          title: 'Street',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' }
          ]
        },
        {
          data: 'address.zipCode',
          title: 'ZIP Code',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            { name: 'number' }
          ]
        },
        {
          data: 'address.location.latitude',
          title: 'Latitude',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            {
              name: 'pattern', arg: "-?(90(\\.0{1,6})?|[1-8]?\\d(\\.\\d{1,6})?|\\d(\\.\\d{1,6})?)"
            }
          ]
        },
        {
          data: 'address.location.longitude',
          title: 'Longtitude',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            {
              name: 'pattern', arg: "-?((\\d{1,2}|1[0-7]\\d)(\\.\\d{1,6})?|180(\\.0{1,6})?)"
            }
          ]
        },
        {
          data: 'phoneNumber',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Phone Number',
          validators: [
            { name: 'number' },
            { validator: 'required' }
          ]
        },
        {
          data: 'created_at',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Created on',
          readOnly: true,
        },
        {
          data: 'updated_at',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Last Updated at',
          readOnly: true
        }
      ]
    }
  ]
}